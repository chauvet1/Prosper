// Intelligent Retry Logic System
// Implements exponential backoff with jitter and different strategies for different error types

import { ErrorLogger } from './error-handler'

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number // in milliseconds
  maxDelay: number // in milliseconds
  backoffMultiplier: number
  jitter: boolean
  jitterRange: number // percentage (0-1)
  retryableErrors: string[]
  nonRetryableErrors: string[]
}

export interface RetryAttempt {
  attemptNumber: number
  timestamp: number
  delay: number
  error?: Error
  success: boolean
}

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: Error
  attempts: RetryAttempt[]
  totalTime: number
  finalAttempt: number
}

export type RetryStrategy = 'exponential' | 'linear' | 'fixed' | 'custom'

class IntelligentRetry {
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    jitter: true,
    jitterRange: 0.1, // 10% jitter
    retryableErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'quota',
      'rate limit',
      'timeout',
      'network',
      'temporary'
    ],
    nonRetryableErrors: [
      'authentication',
      'authorization',
      'permission',
      'invalid',
      'malformed',
      'not found',
      'forbidden'
    ]
  }

  /**
   * Execute function with intelligent retry logic
   */
  public async execute<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    strategy: RetryStrategy = 'exponential'
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const attempts: RetryAttempt[] = []
    const startTime = Date.now()

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      const attemptStartTime = Date.now()
      
      try {
        const result = await fn()
        const attemptEndTime = Date.now()

        attempts.push({
          attemptNumber: attempt,
          timestamp: attemptStartTime,
          delay: 0,
          success: true
        })

        ErrorLogger.logInfo(`Retry successful on attempt ${attempt}`, {
          attempt,
          totalTime: attemptEndTime - startTime,
          strategy
        })

        return {
          success: true,
          result,
          attempts,
          totalTime: attemptEndTime - startTime,
          finalAttempt: attempt
        }

      } catch (error) {
        const attemptEndTime = Date.now()
        const errorMessage = (error as Error).message.toLowerCase()

        // Check if error is retryable
        if (!this.isRetryableError(errorMessage, finalConfig)) {
          attempts.push({
            attemptNumber: attempt,
            timestamp: attemptStartTime,
            delay: 0,
            error: error as Error,
            success: false
          })

          ErrorLogger.logWarning(`Non-retryable error encountered`, {
            attempt,
            error: errorMessage,
            strategy
          })

          return {
            success: false,
            error: error as Error,
            attempts,
            totalTime: attemptEndTime - startTime,
            finalAttempt: attempt
          }
        }

        // If this is the last attempt, return failure
        if (attempt === finalConfig.maxAttempts) {
          attempts.push({
            attemptNumber: attempt,
            timestamp: attemptStartTime,
            delay: 0,
            error: error as Error,
            success: false
          })

          ErrorLogger.logError(error as Error, {
            context: 'retry-final-attempt',
            attempt,
            totalTime: attemptEndTime - startTime,
            strategy
          })

          return {
            success: false,
            error: error as Error,
            attempts,
            totalTime: attemptEndTime - startTime,
            finalAttempt: attempt
          }
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, finalConfig, strategy)
        
        attempts.push({
          attemptNumber: attempt,
          timestamp: attemptStartTime,
          delay,
          error: error as Error,
          success: false
        })

        ErrorLogger.logWarning(`Retry attempt ${attempt} failed, retrying in ${delay}ms`, {
          attempt,
          error: errorMessage,
          delay,
          strategy
        })

        // Wait before next attempt
        await this.sleep(delay)
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      attempts,
      totalTime: Date.now() - startTime,
      finalAttempt: finalConfig.maxAttempts
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorMessage: string, config: RetryConfig): boolean {
    // Check non-retryable errors first
    for (const nonRetryable of config.nonRetryableErrors) {
      if (errorMessage.includes(nonRetryable.toLowerCase())) {
        return false
      }
    }

    // Check retryable errors
    for (const retryable of config.retryableErrors) {
      if (errorMessage.includes(retryable.toLowerCase())) {
        return true
      }
    }

    // Default to retryable for unknown errors
    return true
  }

  /**
   * Calculate delay for next attempt
   */
  private calculateDelay(attempt: number, config: RetryConfig, strategy: RetryStrategy): number {
    let delay: number

    switch (strategy) {
      case 'exponential':
        delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        )
        break

      case 'linear':
        delay = Math.min(config.baseDelay * attempt, config.maxDelay)
        break

      case 'fixed':
        delay = config.baseDelay
        break

      case 'custom':
        // Custom strategy - can be extended
        delay = this.customDelayStrategy(attempt, config)
        break

      default:
        delay = config.baseDelay
    }

    // Apply jitter if enabled
    if (config.jitter) {
      const jitterAmount = delay * config.jitterRange * Math.random()
      delay += jitterAmount
    }

    return Math.floor(delay)
  }

  /**
   * Custom delay strategy
   */
  private customDelayStrategy(attempt: number, config: RetryConfig): number {
    // Fibonacci-based delay with cap
    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
    const fibIndex = Math.min(attempt - 1, fibonacci.length - 1)
    return Math.min(fibonacci[fibIndex] * config.baseDelay, config.maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Create retry configuration for specific error types
   */
  public createConfigForErrorType(errorType: 'network' | 'quota' | 'rate_limit' | 'timeout' | 'general'): RetryConfig {
    const configs = {
      network: {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitter: true,
        jitterRange: 0.2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'network'],
        nonRetryableErrors: ['authentication', 'authorization', 'permission']
      },
      quota: {
        maxAttempts: 2,
        baseDelay: 5000,
        maxDelay: 30000,
        backoffMultiplier: 3,
        jitter: true,
        jitterRange: 0.1,
        retryableErrors: ['quota', 'limit exceeded'],
        nonRetryableErrors: ['authentication', 'authorization']
      },
      rate_limit: {
        maxAttempts: 4,
        baseDelay: 2000,
        maxDelay: 60000,
        backoffMultiplier: 2.5,
        jitter: true,
        jitterRange: 0.3,
        retryableErrors: ['rate limit', 'too many requests', 'throttled'],
        nonRetryableErrors: ['authentication', 'authorization']
      },
      timeout: {
        maxAttempts: 3,
        baseDelay: 3000,
        maxDelay: 15000,
        backoffMultiplier: 2,
        jitter: true,
        jitterRange: 0.15,
        retryableErrors: ['timeout', 'ETIMEDOUT', 'request timeout'],
        nonRetryableErrors: ['authentication', 'authorization', 'invalid']
      },
      general: this.defaultConfig
    }

    return configs[errorType]
  }

  /**
   * Execute with error type detection
   */
  public async executeWithErrorDetection<T>(
    fn: () => Promise<T>,
    customConfig: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    // First attempt to detect error type
    try {
      return await this.execute(fn, customConfig, 'exponential')
    } catch (error) {
      const errorMessage = (error as Error).message.toLowerCase()
      let errorType: 'network' | 'quota' | 'rate_limit' | 'timeout' | 'general' = 'general'

      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorType = 'quota'
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('throttled')) {
        errorType = 'rate_limit'
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorType = 'timeout'
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorType = 'network'
      }

      const config = this.createConfigForErrorType(errorType)
      const finalConfig = { ...config, ...customConfig }

      return await this.execute(fn, finalConfig, 'exponential')
    }
  }

  /**
   * Get retry statistics
   */
  public getRetryStats(attempts: RetryAttempt[]): {
    totalAttempts: number
    successfulAttempts: number
    failedAttempts: number
    totalDelay: number
    averageDelay: number
    successRate: number
  } {
    const totalAttempts = attempts.length
    const successfulAttempts = attempts.filter(a => a.success).length
    const failedAttempts = totalAttempts - successfulAttempts
    const totalDelay = attempts.reduce((sum, a) => sum + a.delay, 0)
    const averageDelay = totalAttempts > 0 ? totalDelay / totalAttempts : 0
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      totalDelay,
      averageDelay,
      successRate
    }
  }

  /**
   * Create retry wrapper for a function
   */
  public createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    config: Partial<RetryConfig> = {},
    strategy: RetryStrategy = 'exponential'
  ): T {
    return (async (...args: Parameters<T>) => {
      const result = await this.execute(
        () => fn(...args),
        config,
        strategy
      )

      if (result.success) {
        return result.result
      } else {
        throw result.error
      }
    }) as T
  }
}

// Singleton instance
export const intelligentRetry = new IntelligentRetry()

// Export types and class
export { IntelligentRetry }
export type { RetryConfig, RetryAttempt, RetryResult, RetryStrategy }
