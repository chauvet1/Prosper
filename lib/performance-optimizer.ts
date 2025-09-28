// Performance Optimization System
// Implements intelligent caching, pre-computation, and response time optimization

import { ErrorLogger } from './error-handler'

export interface PerformanceConfig {
  enableCaching: boolean
  enablePreComputation: boolean
  enableResponseOptimization: boolean
  cacheStrategy: 'lru' | 'ttl' | 'hybrid'
  maxCacheSize: number
  defaultTTL: number
  preComputationThreshold: number
  responseTimeTarget: number
  enableCompression: boolean
  enableDeduplication: boolean
  enableParallelProcessing: boolean
  maxConcurrentRequests: number
}

export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

export interface PerformanceMetrics {
  responseTime: number
  cacheHitRate: number
  cacheMissRate: number
  preComputationRate: number
  compressionRatio: number
  deduplicationRate: number
  parallelProcessingRate: number
  totalRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
}

export interface OptimizationResult<T> {
  result: T
  fromCache: boolean
  responseTime: number
  cacheKey: string
  optimizationApplied: string[]
  metadata: {
    timestamp: number
    cacheHit: boolean
    preComputed: boolean
    compressed: boolean
    deduplicated: boolean
    parallelProcessed: boolean
  }
}

export interface PreComputationTask {
  id: string
  key: string
  computation: () => Promise<any>
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedDuration: number
  dependencies: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: Error
  createdAt: number
  startedAt?: number
  completedAt?: number
}

export interface CompressionResult {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  algorithm: 'gzip' | 'brotli' | 'deflate'
  compressed: boolean
}

class PerformanceOptimizer {
  private config: PerformanceConfig
  private cache: Map<string, CacheEntry<any>> = new Map()
  private preComputationQueue: Map<string, PreComputationTask> = new Map()
  private performanceMetrics: PerformanceMetrics
  private responseTimeHistory: number[] = []
  private maxHistorySize = 1000
  private compressionCache: Map<string, CompressionResult> = new Map()
  private deduplicationMap: Map<string, string> = new Map()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableCaching: true,
      enablePreComputation: true,
      enableResponseOptimization: true,
      cacheStrategy: 'hybrid',
      maxCacheSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      preComputationThreshold: 0.1, // 10% of requests
      responseTimeTarget: 2000, // 2 seconds
      enableCompression: true,
      enableDeduplication: true,
      enableParallelProcessing: true,
      maxConcurrentRequests: 10,
      ...config
    }

    this.performanceMetrics = {
      responseTime: 0,
      cacheHitRate: 0,
      cacheMissRate: 0,
      preComputationRate: 0,
      compressionRatio: 0,
      deduplicationRate: 0,
      parallelProcessingRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    }

    this.startPerformanceMonitoring()
  }

  /**
   * Optimize function execution with caching and pre-computation
   */
  public async optimize<T>(
    key: string,
    computation: () => Promise<T>,
    options: {
      ttl?: number
      priority?: 'low' | 'medium' | 'high' | 'critical'
      enablePreComputation?: boolean
      enableCompression?: boolean
      enableDeduplication?: boolean
      enableParallelProcessing?: boolean
    } = {}
  ): Promise<OptimizationResult<T>> {
    const startTime = Date.now()
    const optimizationApplied: string[] = []

    try {
      // Check for deduplication
      if (this.config.enableDeduplication && options.enableDeduplication !== false) {
        const deduplicationKey = this.generateDeduplicationKey(key, computation)
        if (this.deduplicationMap.has(deduplicationKey)) {
          const cachedKey = this.deduplicationMap.get(deduplicationKey)!
          const cachedResult = await this.getFromCache<T>(cachedKey)
          if (cachedResult) {
            optimizationApplied.push('deduplication')
            return {
              result: cachedResult,
              fromCache: true,
              responseTime: Date.now() - startTime,
              cacheKey: cachedKey,
              optimizationApplied,
              metadata: {
                timestamp: Date.now(),
                cacheHit: true,
                preComputed: false,
                compressed: false,
                deduplicated: true,
                parallelProcessed: false
              }
            }
          }
        }
      }

      // Check cache first
      if (this.config.enableCaching) {
        const cachedResult = await this.getFromCache<T>(key)
        if (cachedResult) {
          optimizationApplied.push('cache')
          this.updatePerformanceMetrics(true, Date.now() - startTime)
          return {
            result: cachedResult,
            fromCache: true,
            responseTime: Date.now() - startTime,
            cacheKey: key,
            optimizationApplied,
            metadata: {
              timestamp: Date.now(),
              cacheHit: true,
              preComputed: false,
              compressed: false,
              deduplicated: false,
              parallelProcessed: false
            }
          }
        }
      }

      // Execute computation
      let result = await computation()

      // Apply compression if enabled
      if (this.config.enableCompression && options.enableCompression !== false) {
        const compressionResult = await this.compress(result)
        if (compressionResult.compressed) {
          result = compressionResult.compressedData as T
          optimizationApplied.push('compression')
        }
      }

      // Cache the result
      if (this.config.enableCaching) {
        await this.setCache(key, result, options.ttl)
        optimizationApplied.push('cache')
      }

      // Update deduplication map
      if (this.config.enableDeduplication && options.enableDeduplication !== false) {
        const deduplicationKey = this.generateDeduplicationKey(key, computation)
        this.deduplicationMap.set(deduplicationKey, key)
      }

      // Schedule pre-computation if needed
      if (this.config.enablePreComputation && options.enablePreComputation !== false) {
        this.schedulePreComputation(key, computation, options.priority || 'medium')
        optimizationApplied.push('pre-computation')
      }

      this.updatePerformanceMetrics(false, Date.now() - startTime)

      return {
        result,
        fromCache: false,
        responseTime: Date.now() - startTime,
        cacheKey: key,
        optimizationApplied,
        metadata: {
          timestamp: Date.now(),
          cacheHit: false,
          preComputed: false,
          compressed: optimizationApplied.includes('compression'),
          deduplicated: optimizationApplied.includes('deduplication'),
          parallelProcessed: false
        }
      }

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'performance-optimization', key })
      throw error
    }
  }

  /**
   * Get value from cache
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    return entry.value as T
  }

  /**
   * Set value in cache
   */
  private async setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(value)
    }

    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictCacheEntry()
    }

    this.cache.set(key, entry)
  }

  /**
   * Evict cache entry based on strategy
   */
  private evictCacheEntry(): void {
    switch (this.config.cacheStrategy) {
      case 'lru':
        this.evictLRU()
        break
      case 'ttl':
        this.evictTTL()
        break
      case 'hybrid':
        this.evictHybrid()
        break
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Evict expired TTL entry
   */
  private evictTTL(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        return
      }
    }
  }

  /**
   * Evict using hybrid strategy
   */
  private evictHybrid(): void {
    // First try to evict expired entries
    this.evictTTL()
    
    // If no expired entries, evict LRU
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLRU()
    }
  }

  /**
   * Schedule pre-computation task
   */
  private schedulePreComputation(
    key: string,
    computation: () => Promise<any>,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const task: PreComputationTask = {
      id: `precomp_${Date.now()}_${Math.random()}`,
      key,
      computation,
      priority,
      estimatedDuration: 1000, // Default 1 second
      dependencies: [],
      status: 'pending',
      createdAt: Date.now()
    }

    this.preComputationQueue.set(task.id, task)
    this.processPreComputationQueue()
  }

  /**
   * Process pre-computation queue
   */
  private async processPreComputationQueue(): Promise<void> {
    const runningTasks = Array.from(this.preComputationQueue.values())
      .filter(task => task.status === 'running').length

    if (runningTasks >= this.config.maxConcurrentRequests) {
      return
    }

    const pendingTasks = Array.from(this.preComputationQueue.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))

    for (const task of pendingTasks) {
      if (runningTasks >= this.config.maxConcurrentRequests) break
      
      this.executePreComputationTask(task)
      runningTasks++
    }
  }

  /**
   * Execute pre-computation task
   */
  private async executePreComputationTask(task: PreComputationTask): Promise<void> {
    task.status = 'running'
    task.startedAt = Date.now()

    try {
      const result = await task.computation()
      task.result = result
      task.status = 'completed'
      task.completedAt = Date.now()

      // Cache the result
      await this.setCache(task.key, result)

      // Remove from queue
      this.preComputationQueue.delete(task.id)

    } catch (error) {
      task.error = error as Error
      task.status = 'failed'
      task.completedAt = Date.now()

      ErrorLogger.log(error as Error, { 
        context: 'pre-computation', 
        taskId: task.id,
        key: task.key
      })

      // Remove from queue
      this.preComputationQueue.delete(task.id)
    }
  }

  /**
   * Get priority value
   */
  private getPriorityValue(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (priority) {
      case 'critical': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  /**
   * Compress data
   */
  private async compress(data: any): Promise<CompressionResult & { compressedData?: any }> {
    const originalSize = this.calculateSize(data)
    
    // Check if already compressed
    const cacheKey = JSON.stringify(data)
    if (this.compressionCache.has(cacheKey)) {
      return this.compressionCache.get(cacheKey)!
    }

    try {
      // Simple compression simulation (in real implementation, use actual compression)
      const compressedData = JSON.stringify(data)
      const compressedSize = compressedData.length
      const compressionRatio = (originalSize - compressedSize) / originalSize

      const result: CompressionResult & { compressedData?: any } = {
        originalSize,
        compressedSize,
        compressionRatio,
        algorithm: 'gzip',
        compressed: compressionRatio > 0.1, // Only compress if >10% reduction
        compressedData: compressionRatio > 0.1 ? compressedData : data
      }

      this.compressionCache.set(cacheKey, result)
      return result

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'compression' })
      return {
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        algorithm: 'gzip',
        compressed: false,
        compressedData: data
      }
    }
  }

  /**
   * Generate deduplication key
   */
  private generateDeduplicationKey(key: string, computation: () => Promise<any>): string {
    // Create a hash of the computation function and key
    const computationString = computation.toString()
    return `dedup_${this.hashString(key + computationString)}`
  }

  /**
   * Hash string
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Calculate size of data
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length
    } catch {
      return 0
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(cacheHit: boolean, responseTime: number): void {
    this.performanceMetrics.totalRequests++
    this.performanceMetrics.responseTime = responseTime

    // Update cache metrics
    if (cacheHit) {
      this.performanceMetrics.cacheHitRate = 
        (this.performanceMetrics.cacheHitRate * (this.performanceMetrics.totalRequests - 1) + 1) / 
        this.performanceMetrics.totalRequests
    } else {
      this.performanceMetrics.cacheMissRate = 
        (this.performanceMetrics.cacheMissRate * (this.performanceMetrics.totalRequests - 1) + 1) / 
        this.performanceMetrics.totalRequests
    }

    // Update response time history
    this.responseTimeHistory.push(responseTime)
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory = this.responseTimeHistory.slice(-this.maxHistorySize)
    }

    // Calculate percentiles
    const sortedTimes = [...this.responseTimeHistory].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    this.performanceMetrics.averageResponseTime = 
      sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length
    this.performanceMetrics.p95ResponseTime = sortedTimes[p95Index] || 0
    this.performanceMetrics.p99ResponseTime = sortedTimes[p99Index] || 0
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.cleanupExpiredCache()
      this.cleanupCompressionCache()
      this.cleanupDeduplicationMap()
    }, 60000) // Cleanup every minute
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Cleanup compression cache
   */
  private cleanupCompressionCache(): void {
    // Keep only recent compression results
    if (this.compressionCache.size > 100) {
      const entries = Array.from(this.compressionCache.entries())
      entries.sort((a, b) => b[1].originalSize - a[1].originalSize)
      this.compressionCache.clear()
      entries.slice(0, 50).forEach(([key, value]) => {
        this.compressionCache.set(key, value)
      })
    }
  }

  /**
   * Cleanup deduplication map
   */
  private cleanupDeduplicationMap(): void {
    // Keep only recent deduplication entries
    if (this.deduplicationMap.size > 1000) {
      const entries = Array.from(this.deduplicationMap.entries())
      this.deduplicationMap.clear()
      entries.slice(0, 500).forEach(([key, value]) => {
        this.deduplicationMap.set(key, value)
      })
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
    missRate: number
    totalEntries: number
    expiredEntries: number
  } {
    const now = Date.now()
    const expiredEntries = Array.from(this.cache.values())
      .filter(entry => now - entry.timestamp > entry.ttl).length

    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: this.performanceMetrics.cacheHitRate,
      missRate: this.performanceMetrics.cacheMissRate,
      totalEntries: this.cache.size,
      expiredEntries
    }
  }

  /**
   * Get pre-computation statistics
   */
  public getPreComputationStats(): {
    queueSize: number
    runningTasks: number
    completedTasks: number
    failedTasks: number
    averageCompletionTime: number
  } {
    const tasks = Array.from(this.preComputationQueue.values())
    const runningTasks = tasks.filter(task => task.status === 'running').length
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const failedTasks = tasks.filter(task => task.status === 'failed').length

    const completedTasksWithTime = tasks.filter(task => 
      task.status === 'completed' && task.startedAt && task.completedAt
    )
    const averageCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => 
          sum + (task.completedAt! - task.startedAt!), 0) / completedTasksWithTime.length
      : 0

    return {
      queueSize: this.preComputationQueue.size,
      runningTasks,
      completedTasks,
      failedTasks,
      averageCompletionTime
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Clear pre-computation queue
   */
  public clearPreComputationQueue(): void {
    this.preComputationQueue.clear()
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config }
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.performanceMetrics.cacheHitRate < 0.8) {
      recommendations.push('Consider increasing cache size or TTL to improve cache hit rate')
    }

    if (this.performanceMetrics.averageResponseTime > this.config.responseTimeTarget) {
      recommendations.push('Response time exceeds target. Consider enabling more optimizations')
    }

    if (this.performanceMetrics.p95ResponseTime > this.config.responseTimeTarget * 2) {
      recommendations.push('95th percentile response time is high. Review slow operations')
    }

    if (this.cache.size >= this.config.maxCacheSize * 0.9) {
      recommendations.push('Cache is nearly full. Consider increasing max cache size')
    }

    return recommendations
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer()

// Export types and class
export { PerformanceOptimizer }
export type { 
  PerformanceConfig, 
  CacheEntry, 
  PerformanceMetrics, 
  OptimizationResult,
  PreComputationTask,
  CompressionResult
}
