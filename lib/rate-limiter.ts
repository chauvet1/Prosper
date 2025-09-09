// Rate limiting for API endpoints

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class MemoryRateLimitStore {
  private store: RateLimitStore = {}

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const resetTime = now + windowMs

    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = { count: 1, resetTime }
    } else {
      this.store[key].count++
    }

    return this.store[key]
  }

  cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key]
      }
    })
  }
}

const store = new MemoryRateLimitStore()

// Cleanup expired entries every minute
setInterval(() => {
  store.cleanup()
}, 60 * 1000)

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const { count, resetTime } = store.increment(identifier, this.config.windowMs)
    
    const allowed = count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - count)

    return { allowed, remaining, resetTime }
  }

  getHeaders(identifier: string) {
    const result = this.check(identifier)
    
    return {
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
    }
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // General API endpoints
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later'
  }),

  // AI assistant endpoints (more restrictive)
  aiAssistant: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many AI requests, please wait before trying again'
  }),

  // Project estimator (very restrictive)
  projectEstimator: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    message: 'Too many estimation requests, please wait before trying again'
  }),

  // Lead capture
  leadCapture: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many lead submissions, please try again later'
  }),

  // Blog endpoints
  blog: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    message: 'Too many blog requests, please try again later'
  }),

  // Portfolio endpoints
  portfolio: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 150,
    message: 'Too many portfolio requests, please try again later'
  })
}

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for different hosting environments)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // You could also include user agent or other identifiers
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.substring(0, 50)}`
}

// Middleware function for Next.js API routes
export function withRateLimit(limiter: RateLimiter) {
  return function rateLimitMiddleware(handler: Function) {
    return async function(request: Request, ...args: any[]) {
      const identifier = getClientIdentifier(request)
      const result = limiter.check(identifier)
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: limiter.config.message || 'Too many requests',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...limiter.getHeaders(identifier),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      
      if (response instanceof Response) {
        const headers = limiter.getHeaders(identifier)
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }

      return response
    }
  }
}

// Adaptive rate limiting based on system load
export class AdaptiveRateLimiter extends RateLimiter {
  private baseMaxRequests: number

  constructor(config: RateLimitConfig) {
    super(config)
    this.baseMaxRequests = config.maxRequests
  }

  private getSystemLoad(): number {
    // Simple system load estimation
    const memUsage = process.memoryUsage()
    const memPercent = memUsage.heapUsed / memUsage.heapTotal
    
    // Return load factor (0-1, where 1 is high load)
    return Math.min(memPercent * 2, 1)
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const systemLoad = this.getSystemLoad()
    
    // Reduce max requests under high load
    const adjustedMaxRequests = Math.floor(
      this.baseMaxRequests * (1 - systemLoad * 0.5)
    )
    
    // Temporarily adjust the config
    const originalMax = this.config.maxRequests
    this.config.maxRequests = Math.max(adjustedMaxRequests, 1)
    
    const result = super.check(identifier)
    
    // Restore original config
    this.config.maxRequests = originalMax
    
    return result
  }
}

// Rate limiting statistics
export function getRateLimitStats() {
  return {
    activeKeys: Object.keys((store as any).store).length,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  }
}
