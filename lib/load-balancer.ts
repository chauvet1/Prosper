// Load Balancing Implementation
// Implements intelligent request distribution, health-based routing, and performance-based load balancing

import { ErrorLogger } from './error-handler'

export interface LoadBalancerConfig {
  strategy: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'least_response_time' | 'health_based' | 'performance_based'
  enableHealthChecks: boolean
  healthCheckInterval: number
  healthCheckTimeout: number
  enableFailover: boolean
  maxFailoverAttempts: number
  enableStickySessions: boolean
  sessionTimeout: number
  enableCircuitBreaker: boolean
  circuitBreakerThreshold: number
  enableMetrics: boolean
  metricsInterval: number
  enableAutoScaling: boolean
  scalingThreshold: number
  maxInstances: number
  minInstances: number
}

export interface ServiceInstance {
  id: string
  name: string
  url: string
  weight: number
  isHealthy: boolean
  isAvailable: boolean
  currentConnections: number
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  lastHealthCheck: number
  lastRequest: number
  circuitBreakerState: 'closed' | 'open' | 'half_open'
  failureCount: number
  successCount: number
  metadata: Record<string, any>
}

export interface LoadBalancerMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  errorRate: number
  throughput: number
  activeConnections: number
  healthCheckSuccessRate: number
  failoverCount: number
  circuitBreakerTrips: number
}

export interface LoadBalanceResult {
  instance: ServiceInstance
  strategy: string
  responseTime: number
  fromCache: boolean
  failoverUsed: boolean
  circuitBreakerUsed: boolean
  metadata: {
    timestamp: number
    requestId: string
    sessionId?: string
    userAgent?: string
    ipAddress?: string
  }
}

export interface HealthCheckResult {
  instanceId: string
  isHealthy: boolean
  responseTime: number
  error?: Error
  timestamp: number
  statusCode?: number
  responseSize?: number
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action'
  reason: string
  currentInstances: number
  targetInstances: number
  metrics: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
    throughput: number
  }
  timestamp: number
}

class LoadBalancer {
  private config: LoadBalancerConfig
  private instances: Map<string, ServiceInstance> = new Map()
  private metrics: LoadBalancerMetrics
  private healthCheckInterval?: NodeJS.Timeout
  private metricsInterval?: NodeJS.Timeout
  private currentIndex: number = 0
  private sessionMap: Map<string, string> = new Map()
  private responseTimeHistory: number[] = []
  private maxHistorySize = 1000

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.config = {
      strategy: 'health_based',
      enableHealthChecks: true,
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      enableFailover: true,
      maxFailoverAttempts: 3,
      enableStickySessions: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      enableMetrics: true,
      metricsInterval: 60000, // 1 minute
      enableAutoScaling: false,
      scalingThreshold: 0.8,
      maxInstances: 10,
      minInstances: 1,
      ...config
    }

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      activeConnections: 0,
      healthCheckSuccessRate: 0,
      failoverCount: 0,
      circuitBreakerTrips: 0
    }

    if (this.config.enableHealthChecks) {
      this.startHealthChecks()
    }

    if (this.config.enableMetrics) {
      this.startMetricsCollection()
    }
  }

  /**
   * Add service instance
   */
  public addInstance(instance: Omit<ServiceInstance, 'id'>): string {
    const id = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const serviceInstance: ServiceInstance = {
      id,
      ...instance,
      isHealthy: true,
      isAvailable: true,
      currentConnections: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastHealthCheck: 0,
      lastRequest: 0,
      circuitBreakerState: 'closed',
      failureCount: 0,
      successCount: 0,
      metadata: {}
    }

    this.instances.set(id, serviceInstance)
    
    ErrorLogger.logInfo(`Service instance added: ${id}`, {
      name: instance.name,
      url: instance.url,
      weight: instance.weight
    })

    return id
  }

  /**
   * Remove service instance
   */
  public removeInstance(instanceId: string): boolean {
    const removed = this.instances.delete(instanceId)
    if (removed) {
      ErrorLogger.logInfo(`Service instance removed: ${instanceId}`)
    }
    return removed
  }

  /**
   * Get next available instance
   */
  public async getNextInstance(
    requestId: string,
    sessionId?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<LoadBalanceResult> {
    const startTime = Date.now()
    let instance: ServiceInstance | null = null
    let strategy = this.config.strategy
    let failoverUsed = false
    let circuitBreakerUsed = false

    try {
      // Check for sticky session
      if (this.config.enableStickySessions && sessionId) {
        const stickyInstanceId = this.sessionMap.get(sessionId)
        if (stickyInstanceId) {
          const stickyInstance = this.instances.get(stickyInstanceId)
          if (stickyInstance && this.isInstanceAvailable(stickyInstance)) {
            instance = stickyInstance
            strategy = 'sticky_session'
          }
        }
      }

      // If no sticky session or instance not available, use load balancing strategy
      if (!instance) {
        instance = await this.selectInstance(strategy)
      }

      // Handle failover if needed
      if (!instance && this.config.enableFailover) {
        instance = await this.handleFailover()
        failoverUsed = true
      }

      if (!instance) {
        throw new Error('No available service instances')
      }

      // Update instance metrics
      this.updateInstanceMetrics(instance, startTime)

      // Update session mapping
      if (this.config.enableStickySessions && sessionId) {
        this.sessionMap.set(sessionId, instance.id)
      }

      // Check circuit breaker
      if (this.config.enableCircuitBreaker && instance.circuitBreakerState === 'open') {
        circuitBreakerUsed = true
        throw new Error(`Circuit breaker is open for instance ${instance.id}`)
      }

      const result: LoadBalanceResult = {
        instance,
        strategy,
        responseTime: Date.now() - startTime,
        fromCache: false,
        failoverUsed,
        circuitBreakerUsed,
        metadata: {
          timestamp: Date.now(),
          requestId,
          sessionId,
          userAgent,
          ipAddress
        }
      }

      this.updateMetrics(result)
      return result

    } catch (error) {
      this.metrics.failedRequests++
      ErrorLogger.log(error as Error, { 
        context: 'load-balancing', 
        requestId,
        strategy
      })
      throw error
    }
  }

  /**
   * Select instance based on strategy
   */
  private async selectInstance(strategy: string): Promise<ServiceInstance | null> {
    const availableInstances = Array.from(this.instances.values())
      .filter(instance => this.isInstanceAvailable(instance))

    if (availableInstances.length === 0) {
      return null
    }

    switch (strategy) {
      case 'round_robin':
        return this.roundRobinSelection(availableInstances)
      case 'weighted_round_robin':
        return this.weightedRoundRobinSelection(availableInstances)
      case 'least_connections':
        return this.leastConnectionsSelection(availableInstances)
      case 'least_response_time':
        return this.leastResponseTimeSelection(availableInstances)
      case 'health_based':
        return this.healthBasedSelection(availableInstances)
      case 'performance_based':
        return this.performanceBasedSelection(availableInstances)
      default:
        return this.roundRobinSelection(availableInstances)
    }
  }

  /**
   * Round robin selection
   */
  private roundRobinSelection(instances: ServiceInstance[]): ServiceInstance {
    const instance = instances[this.currentIndex % instances.length]
    this.currentIndex++
    return instance
  }

  /**
   * Weighted round robin selection
   */
  private weightedRoundRobinSelection(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0)
    let random = Math.random() * totalWeight

    for (const instance of instances) {
      random -= instance.weight
      if (random <= 0) {
        return instance
      }
    }

    return instances[0]
  }

  /**
   * Least connections selection
   */
  private leastConnectionsSelection(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => 
      instance.currentConnections < min.currentConnections ? instance : min
    )
  }

  /**
   * Least response time selection
   */
  private leastResponseTimeSelection(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => 
      instance.averageResponseTime < min.averageResponseTime ? instance : min
    )
  }

  /**
   * Health-based selection
   */
  private healthBasedSelection(instances: ServiceInstance[]): ServiceInstance {
    const healthyInstances = instances.filter(instance => instance.isHealthy)
    if (healthyInstances.length === 0) {
      return instances[0] // Fallback to any instance
    }
    return this.leastResponseTimeSelection(healthyInstances)
  }

  /**
   * Performance-based selection
   */
  private performanceBasedSelection(instances: ServiceInstance[]): ServiceInstance {
    // Score instances based on multiple factors
    const scoredInstances = instances.map(instance => ({
      instance,
      score: this.calculatePerformanceScore(instance)
    }))

    scoredInstances.sort((a, b) => b.score - a.score)
    return scoredInstances[0].instance
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(instance: ServiceInstance): number {
    const healthScore = instance.isHealthy ? 100 : 0
    const responseTimeScore = Math.max(0, 100 - (instance.averageResponseTime / 100))
    const errorRateScore = Math.max(0, 100 - (instance.errorRate * 100))
    const connectionScore = Math.max(0, 100 - (instance.currentConnections / 10))

    return (healthScore * 0.4 + responseTimeScore * 0.3 + errorRateScore * 0.2 + connectionScore * 0.1)
  }

  /**
   * Handle failover
   */
  private async handleFailover(): Promise<ServiceInstance | null> {
    this.metrics.failoverCount++
    
    // Try to find any available instance
    const availableInstances = Array.from(this.instances.values())
      .filter(instance => instance.isAvailable)

    if (availableInstances.length === 0) {
      return null
    }

    // Use least connections as failover strategy
    return this.leastConnectionsSelection(availableInstances)
  }

  /**
   * Check if instance is available
   */
  private isInstanceAvailable(instance: ServiceInstance): boolean {
    if (!instance.isAvailable) return false
    if (!instance.isHealthy) return false
    if (this.config.enableCircuitBreaker && instance.circuitBreakerState === 'open') return false
    return true
  }

  /**
   * Update instance metrics
   */
  private updateInstanceMetrics(instance: ServiceInstance, startTime: number): void {
    instance.currentConnections++
    instance.totalRequests++
    instance.lastRequest = Date.now()
    
    const responseTime = Date.now() - startTime
    instance.averageResponseTime = 
      (instance.averageResponseTime * (instance.totalRequests - 1) + responseTime) / instance.totalRequests
  }

  /**
   * Update load balancer metrics
   */
  private updateMetrics(result: LoadBalanceResult): void {
    this.metrics.totalRequests++
    this.metrics.successfulRequests++
    
    // Update response time history
    this.responseTimeHistory.push(result.responseTime)
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory = this.responseTimeHistory.slice(-this.maxHistorySize)
    }

    // Calculate percentiles
    const sortedTimes = [...this.responseTimeHistory].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    this.metrics.averageResponseTime = 
      sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length
    this.metrics.p95ResponseTime = sortedTimes[p95Index] || 0
    this.metrics.p99ResponseTime = sortedTimes[p99Index] || 0

    // Update error rate
    this.metrics.errorRate = 
      (this.metrics.totalRequests - this.metrics.successfulRequests) / this.metrics.totalRequests

    // Update active connections
    this.metrics.activeConnections = Array.from(this.instances.values())
      .reduce((sum, instance) => sum + instance.currentConnections, 0)
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheckInterval)
  }

  /**
   * Perform health checks
   */
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.instances.values()).map(instance =>
      this.performHealthCheck(instance)
    )

    const results = await Promise.allSettled(healthCheckPromises)
    
    let successCount = 0
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isHealthy) {
        successCount++
      }
    }

    this.metrics.healthCheckSuccessRate = successCount / results.length
  }

  /**
   * Perform health check for single instance
   */
  private async performHealthCheck(instance: ServiceInstance): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      // Real health check using actual HTTP request
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        timeout: 5000
      })
      
      const responseTime = Date.now() - startTime
      const isHealthy = responseTime < this.config.healthCheckTimeout

      // Update instance health
      instance.isHealthy = isHealthy
      instance.lastHealthCheck = Date.now()

      if (isHealthy) {
        instance.successCount++
        instance.failureCount = 0
      } else {
        instance.failureCount++
        if (instance.failureCount >= this.config.circuitBreakerThreshold) {
          instance.circuitBreakerState = 'open'
          this.metrics.circuitBreakerTrips++
        }
      }

      return {
        instanceId: instance.id,
        isHealthy,
        responseTime,
        timestamp: Date.now()
      }

    } catch (error) {
      instance.isHealthy = false
      instance.failureCount++
      instance.lastHealthCheck = Date.now()

      if (instance.failureCount >= this.config.circuitBreakerThreshold) {
        instance.circuitBreakerState = 'open'
        this.metrics.circuitBreakerTrips++
      }

      return {
        instanceId: instance.id,
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error as Error,
        timestamp: Date.now()
      }
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics()
    }, this.config.metricsInterval)
  }

  /**
   * Collect metrics
   */
  private collectMetrics(): void {
    // Calculate throughput (requests per second)
    this.metrics.throughput = this.metrics.totalRequests / (this.config.metricsInterval / 1000)

    // Update instance error rates
    for (const instance of this.instances.values()) {
      if (instance.totalRequests > 0) {
        instance.errorRate = instance.failureCount / instance.totalRequests
      }
    }
  }

  /**
   * Get load balancer metrics
   */
  public getMetrics(): LoadBalancerMetrics {
    return { ...this.metrics }
  }

  /**
   * Get instance statistics
   */
  public getInstanceStats(): Array<{
    id: string
    name: string
    url: string
    isHealthy: boolean
    isAvailable: boolean
    currentConnections: number
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    circuitBreakerState: string
  }> {
    return Array.from(this.instances.values()).map(instance => ({
      id: instance.id,
      name: instance.name,
      url: instance.url,
      isHealthy: instance.isHealthy,
      isAvailable: instance.isAvailable,
      currentConnections: instance.currentConnections,
      totalRequests: instance.totalRequests,
      averageResponseTime: instance.averageResponseTime,
      errorRate: instance.errorRate,
      circuitBreakerState: instance.circuitBreakerState
    }))
  }

  /**
   * Get scaling decision
   */
  public getScalingDecision(): ScalingDecision {
    const currentInstances = this.instances.size
    const avgResponseTime = this.metrics.averageResponseTime
    const errorRate = this.metrics.errorRate
    const throughput = this.metrics.throughput

    let action: 'scale_up' | 'scale_down' | 'no_action' = 'no_action'
    let reason = 'No scaling needed'
    let targetInstances = currentInstances

    // Scale up conditions
    if (avgResponseTime > 2000 || errorRate > 0.1 || throughput > this.config.scalingThreshold * 100) {
      if (currentInstances < this.config.maxInstances) {
        action = 'scale_up'
        targetInstances = Math.min(currentInstances + 1, this.config.maxInstances)
        reason = 'High response time, error rate, or throughput'
      }
    }

    // Scale down conditions
    if (avgResponseTime < 500 && errorRate < 0.05 && throughput < this.config.scalingThreshold * 50) {
      if (currentInstances > this.config.minInstances) {
        action = 'scale_down'
        targetInstances = Math.max(currentInstances - 1, this.config.minInstances)
        reason = 'Low response time, error rate, and throughput'
      }
    }

    return {
      action,
      reason,
      currentInstances,
      targetInstances,
      metrics: {
        cpuUsage: 0, // Would be collected from actual metrics
        memoryUsage: 0, // Would be collected from actual metrics
        responseTime: avgResponseTime,
        errorRate,
        throughput
      },
      timestamp: Date.now()
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enableHealthChecks !== undefined) {
      if (newConfig.enableHealthChecks) {
        this.startHealthChecks()
      } else {
        this.stopHealthChecks()
      }
    }

    if (newConfig.enableMetrics !== undefined) {
      if (newConfig.enableMetrics) {
        this.startMetricsCollection()
      } else {
        this.stopMetricsCollection()
      }
    }
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = undefined
    }
  }

  /**
   * Stop metrics collection
   */
  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = undefined
    }
  }

  /**
   * Clear session mappings
   */
  public clearSessions(): void {
    this.sessionMap.clear()
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      activeConnections: 0,
      healthCheckSuccessRate: 0,
      failoverCount: 0,
      circuitBreakerTrips: 0
    }
    this.responseTimeHistory = []
  }

  /**
   * Destroy load balancer
   */
  public destroy(): void {
    this.stopHealthChecks()
    this.stopMetricsCollection()
    this.instances.clear()
    this.sessionMap.clear()
  }
}

// Singleton instance
export const loadBalancer = new LoadBalancer()

// Export types and class
export { LoadBalancer }
export type { 
  LoadBalancerConfig, 
  ServiceInstance, 
  LoadBalancerMetrics, 
  LoadBalanceResult,
  HealthCheckResult,
  ScalingDecision
}
