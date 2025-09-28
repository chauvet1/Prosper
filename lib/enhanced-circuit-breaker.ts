// Enhanced Circuit Breaker System
// Implements dynamic circuit breaker thresholds with automatic recovery testing and health check integration

import { ErrorLogger } from './error-handler'

export interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeout: number // in milliseconds
  monitoringPeriod: number // in milliseconds
  enableDynamicThresholds: boolean
  healthCheckInterval: number // in milliseconds
  enableHealthChecks: boolean
  adaptiveTimeout: boolean
  minTimeout: number
  maxTimeout: number
  timeoutMultiplier: number
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  successes: number
  lastFailureTime: number
  lastSuccessTime: number
  failureRate: number
  successRate: number
  averageResponseTime: number
  totalRequests: number
  isHealthy: boolean
  healthCheckStatus: 'unknown' | 'healthy' | 'unhealthy'
  lastHealthCheck: number
}

export interface HealthCheckResult {
  isHealthy: boolean
  responseTime: number
  error?: Error
  timestamp: number
}

export type HealthCheckFunction = () => Promise<boolean>

class EnhancedCircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private healthCheckFunction?: HealthCheckFunction
  private healthCheckInterval?: NodeJS.Timeout
  private responseTimes: number[] = []
  private maxResponseTimeHistory = 100

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000, // 1 minute
      monitoringPeriod: 120000, // 2 minutes
      enableDynamicThresholds: true,
      healthCheckInterval: 30000, // 30 seconds
      enableHealthChecks: true,
      adaptiveTimeout: true,
      minTimeout: 10000, // 10 seconds
      maxTimeout: 300000, // 5 minutes
      timeoutMultiplier: 1.5,
      ...config
    }

    this.state = {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      failureRate: 0,
      successRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      isHealthy: true,
      healthCheckStatus: 'unknown',
      lastHealthCheck: 0
    }

    if (this.config.enableHealthChecks) {
      this.startHealthChecks()
    }
  }

  /**
   * Execute operation with circuit breaker protection
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now()

    // Check if circuit breaker is open
    if (this.state.state === 'OPEN') {
      if (this.shouldAttemptRecovery()) {
        this.state.state = 'HALF_OPEN'
        ErrorLogger.logInfo('Circuit breaker transitioning to HALF_OPEN', {
          failures: this.state.failures,
          lastFailureTime: this.state.lastFailureTime
        })
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable')
      }
    }

    try {
      const result = await operation()
      const responseTime = Date.now() - startTime
      
      this.onSuccess(responseTime)
      return result

    } catch (error) {
      const responseTime = Date.now() - startTime
      this.onFailure(responseTime, error as Error)
      throw error
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(responseTime: number): void {
    this.state.successes++
    this.state.lastSuccessTime = Date.now()
    this.state.totalRequests++
    
    // Update response time history
    this.updateResponseTimeHistory(responseTime)
    
    // Update success rate
    this.updateSuccessRate()

    // If in HALF_OPEN state and we have enough successes, close the circuit
    if (this.state.state === 'HALF_OPEN' && this.state.successes >= this.config.successThreshold) {
      this.state.state = 'CLOSED'
      this.state.failures = 0
      this.state.isHealthy = true
      
      ErrorLogger.logInfo('Circuit breaker closed after successful recovery', {
        successes: this.state.successes,
        successThreshold: this.config.successThreshold
      })
    }

    // Reset failures if we're in CLOSED state
    if (this.state.state === 'CLOSED') {
      this.state.failures = 0
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(responseTime: number, error: Error): void {
    this.state.failures++
    this.state.lastFailureTime = Date.now()
    this.state.totalRequests++
    
    // Update response time history
    this.updateResponseTimeHistory(responseTime)
    
    // Update failure rate
    this.updateFailureRate()

    // Check if we should open the circuit
    const threshold = this.getDynamicThreshold()
    
    if (this.state.failures >= threshold) {
      this.state.state = 'OPEN'
      this.state.isHealthy = false
      
      ErrorLogger.logWarning('Circuit breaker opened', {
        failures: this.state.failures,
        threshold,
        failureRate: this.state.failureRate,
        error: error.message
      })
    }

    // If in HALF_OPEN state and we fail, go back to OPEN
    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'OPEN'
      this.state.isHealthy = false
      
      ErrorLogger.logWarning('Circuit breaker reopened after failure in HALF_OPEN state', {
        failures: this.state.failures,
        error: error.message
      })
    }
  }

  /**
   * Check if we should attempt recovery
   */
  private shouldAttemptRecovery(): boolean {
    const timeSinceLastFailure = Date.now() - this.state.lastFailureTime
    const timeout = this.getAdaptiveTimeout()
    
    return timeSinceLastFailure >= timeout
  }

  /**
   * Get dynamic threshold based on historical data
   */
  private getDynamicThreshold(): number {
    if (!this.config.enableDynamicThresholds) {
      return this.config.failureThreshold
    }

    // Adjust threshold based on failure rate and response time
    let threshold = this.config.failureThreshold

    // If failure rate is high, lower the threshold
    if (this.state.failureRate > 0.5) {
      threshold = Math.max(2, Math.floor(threshold * 0.7))
    }

    // If response time is high, lower the threshold
    if (this.state.averageResponseTime > 5000) {
      threshold = Math.max(2, Math.floor(threshold * 0.8))
    }

    // If we have many total requests, we can be more lenient
    if (this.state.totalRequests > 100) {
      threshold = Math.min(10, Math.floor(threshold * 1.2))
    }

    return threshold
  }

  /**
   * Get adaptive timeout based on failure patterns
   */
  private getAdaptiveTimeout(): number {
    if (!this.config.adaptiveTimeout) {
      return this.config.timeout
    }

    let timeout = this.config.timeout

    // Increase timeout if failure rate is high
    if (this.state.failureRate > 0.3) {
      timeout = Math.min(this.config.maxTimeout, timeout * this.config.timeoutMultiplier)
    }

    // Decrease timeout if we're recovering well
    if (this.state.successRate > 0.8 && this.state.state === 'HALF_OPEN') {
      timeout = Math.max(this.config.minTimeout, timeout * 0.8)
    }

    return timeout
  }

  /**
   * Update response time history
   */
  private updateResponseTimeHistory(responseTime: number): void {
    this.responseTimes.push(responseTime)
    
    // Keep only recent response times
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes = this.responseTimes.slice(-this.maxResponseTimeHistory)
    }

    // Update average response time
    this.state.averageResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
  }

  /**
   * Update success rate
   */
  private updateSuccessRate(): void {
    if (this.state.totalRequests > 0) {
      this.state.successRate = this.state.successes / this.state.totalRequests
    }
  }

  /**
   * Update failure rate
   */
  private updateFailureRate(): void {
    if (this.state.totalRequests > 0) {
      this.state.failureRate = this.state.failures / this.state.totalRequests
    }
  }

  /**
   * Set health check function
   */
  public setHealthCheck(healthCheckFunction: HealthCheckFunction): void {
    this.healthCheckFunction = healthCheckFunction
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.healthCheckFunction) {
      return
    }

    const startTime = Date.now()
    
    try {
      const isHealthy = await this.healthCheckFunction()
      const responseTime = Date.now() - startTime
      
      this.state.healthCheckStatus = isHealthy ? 'healthy' : 'unhealthy'
      this.state.lastHealthCheck = Date.now()
      this.state.isHealthy = isHealthy

      if (isHealthy && this.state.state === 'OPEN') {
        // If health check passes and circuit is open, transition to HALF_OPEN
        this.state.state = 'HALF_OPEN'
        ErrorLogger.logInfo('Circuit breaker transitioning to HALF_OPEN after successful health check', {
          responseTime,
          healthCheckStatus: this.state.healthCheckStatus
        })
      }

    } catch (error) {
      this.state.healthCheckStatus = 'unhealthy'
      this.state.lastHealthCheck = Date.now()
      this.state.isHealthy = false

      ErrorLogger.logWarning('Health check failed', {
        error: (error as Error).message,
        responseTime: Date.now() - startTime
      })
    }
  }

  /**
   * Get current state
   */
  public getState(): CircuitBreakerState {
    return { ...this.state }
  }

  /**
   * Get detailed statistics
   */
  public getStatistics(): {
    state: CircuitBreakerState
    config: CircuitBreakerConfig
    responseTimeStats: {
      average: number
      min: number
      max: number
      p95: number
      p99: number
    }
    recentFailures: number
    recentSuccesses: number
  } {
    const responseTimeStats = this.calculateResponseTimeStats()
    const recentFailures = this.getRecentFailures()
    const recentSuccesses = this.getRecentSuccesses()

    return {
      state: this.getState(),
      config: this.config,
      responseTimeStats,
      recentFailures,
      recentSuccesses
    }
  }

  /**
   * Calculate response time statistics
   */
  private calculateResponseTimeStats(): {
    average: number
    min: number
    max: number
    p95: number
    p99: number
  } {
    if (this.responseTimes.length === 0) {
      return { average: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b)
    const len = sorted.length

    return {
      average: this.state.averageResponseTime,
      min: sorted[0],
      max: sorted[len - 1],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    }
  }

  /**
   * Get recent failures (last 5 minutes)
   */
  private getRecentFailures(): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return this.state.lastFailureTime > fiveMinutesAgo ? 1 : 0
  }

  /**
   * Get recent successes (last 5 minutes)
   */
  private getRecentSuccesses(): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return this.state.lastSuccessTime > fiveMinutesAgo ? 1 : 0
  }

  /**
   * Reset circuit breaker
   */
  public reset(): void {
    this.state = {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      failureRate: 0,
      successRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      isHealthy: true,
      healthCheckStatus: 'unknown',
      lastHealthCheck: 0
    }
    
    this.responseTimes = []
    
    ErrorLogger.logInfo('Circuit breaker reset', {})
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enableHealthChecks !== undefined) {
      if (newConfig.enableHealthChecks) {
        this.startHealthChecks()
      } else {
        this.stopHealthChecks()
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
   * Destroy circuit breaker
   */
  public destroy(): void {
    this.stopHealthChecks()
  }
}

// Export types and class
export { EnhancedCircuitBreaker }
export type { CircuitBreakerConfig, CircuitBreakerState, HealthCheckResult, HealthCheckFunction }
