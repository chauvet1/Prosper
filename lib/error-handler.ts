// Production-ready error handling and logging

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT')
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      503,
      true,
      'EXTERNAL_SERVICE_ERROR'
    )
    this.name = 'ExternalServiceError'
  }
}

// AI Assistant specific error types
export class ModelUnavailableError extends AppError {
  constructor(
    modelName: string,
    reason: 'quota_exceeded' | 'service_down' | 'timeout' | 'unknown' = 'unknown',
    message?: string
  ) {
    super(
      message || `AI model ${modelName} is unavailable: ${reason}`,
      503,
      true,
      'MODEL_UNAVAILABLE'
    )
    this.name = 'ModelUnavailableError'
  }
}

export class AIResponseError extends AppError {
  constructor(
    modelName: string,
    message?: string,
    public responseTime?: number,
    public tokensUsed?: number
  ) {
    super(
      message || `AI model ${modelName} failed to generate response`,
      500,
      true,
      'AI_RESPONSE_ERROR'
    )
    this.name = 'AIResponseError'
  }
}

// Error logger
export class ErrorLogger {
  static log(error: Error, context?: Record<string, any>) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context: context || {},
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        code: error.code
      })
    }

    if (process.env.NODE_ENV === 'production') {
      // In production, you'd send to logging service (e.g., Sentry, LogRocket)
      console.error('ERROR:', JSON.stringify(errorInfo, null, 2))
      
      // Example: Send to external logging service
      // await sendToLoggingService(errorInfo)
    } else {
      // Development logging
      console.error('🚨 ERROR:', error.message)
      console.error('📍 Stack:', error.stack)
      if (context) {
        console.error('🔍 Context:', context)
      }
    }
  }

  static logWarning(message: string, context?: Record<string, any>) {
    const warningInfo = {
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      context: context || {}
    }

    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING:', JSON.stringify(warningInfo, null, 2))
    } else {
      console.warn('⚠️ WARNING:', message)
      if (context) {
        console.warn('🔍 Context:', context)
      }
    }
  }

  static logInfo(message: string, context?: Record<string, any>) {
    const infoData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context: context || {}
    }

    if (process.env.NODE_ENV === 'production') {
      console.info('INFO:', JSON.stringify(infoData, null, 2))
    } else {
      console.info('ℹ️ INFO:', message)
      if (context) {
        console.info('🔍 Context:', context)
      }
    }
  }
}

// Error response formatter
export function formatErrorResponse(error: Error, includeStack: boolean = false) {
  const isAppError = error instanceof AppError
  
  const response: any = {
    success: false,
    error: {
      message: isAppError ? error.message : 'Internal server error',
      code: isAppError ? error.code : 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  }

  if (includeStack && process.env.NODE_ENV !== 'production') {
    response.error.stack = error.stack
  }

  return response
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      ErrorLogger.log(error as Error, { args })
      throw error
    }
  }
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        ErrorLogger.log(lastError, { 
          operation: 'retry_exhausted',
          attempts: attempt + 1,
          maxRetries 
        })
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      
      ErrorLogger.logWarning(`Operation failed, retrying in ${delay}ms`, {
        attempt: attempt + 1,
        maxRetries,
        error: lastError.message
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 120000 // 2 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new ExternalServiceError('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
      ErrorLogger.logWarning('Circuit breaker opened', {
        failures: this.failures,
        threshold: this.threshold
      })
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// Global error handlers
export function setupGlobalErrorHandlers() {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    ErrorLogger.log(new Error(`Unhandled Rejection: ${reason}`), {
      promise: promise.toString()
    })
  })

  // Uncaught exceptions
  process.on('uncaughtException', (error) => {
    ErrorLogger.log(error, { type: 'uncaughtException' })
    process.exit(1)
  })
}

// Health check utilities
export function createHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  }
}
