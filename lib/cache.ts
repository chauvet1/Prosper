// Cache configuration and utilities for performance optimization

export const CACHE_KEYS = {
  PORTFOLIO_COMPLETE: 'portfolio:complete',
  PORTFOLIO_PERSONAL: 'portfolio:personal',
  PORTFOLIO_SKILLS: 'portfolio:skills',
  PORTFOLIO_PROJECTS: 'portfolio:projects',
  PORTFOLIO_EXPERIENCE: 'portfolio:experience',
  PORTFOLIO_EDUCATION: 'portfolio:education',
  PORTFOLIO_CERTIFICATES: 'portfolio:certificates',
  BLOG_POSTS: 'blog:posts',
  BLOG_CATEGORIES: 'blog:categories',
  BLOG_TAGS: 'blog:tags',
  AI_RESPONSES: 'ai:responses'
} as const

export const CACHE_TTL = {
  PORTFOLIO_DATA: 60 * 60, // 1 hour
  BLOG_POSTS: 60 * 10, // 10 minutes
  BLOG_METADATA: 60 * 30, // 30 minutes
  AI_RESPONSES: 60 * 5, // 5 minutes
  STATIC_DATA: 60 * 60 * 24, // 24 hours
  USER_SESSION: 60 * 60 * 2 // 2 hours
} as const

// Simple in-memory cache for development
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()

  set(key: string, data: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000)
    this.cache.set(key, { data, expires })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Cache instance
export const cache = new MemoryCache()

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache wrapper function
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.PORTFOLIO_DATA
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()
  
  // Store in cache
  cache.set(key, data, ttl)
  
  return data
}

// Cache invalidation helpers
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }

  // For now, just clear all cache if pattern is provided
  // In production, you'd implement pattern matching
  cache.clear()
}

export function invalidatePortfolioCache(): void {
  Object.values(CACHE_KEYS)
    .filter(key => key.startsWith('portfolio:'))
    .forEach(key => cache.delete(key))
}

export function invalidateBlogCache(): void {
  Object.values(CACHE_KEYS)
    .filter(key => key.startsWith('blog:'))
    .forEach(key => cache.delete(key))
}

// Response caching headers
export function getCacheHeaders(ttl: number) {
  return {
    'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'CDN-Cache-Control': `public, max-age=${ttl}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${ttl}`
  }
}

// Stale-while-revalidate pattern
export async function withSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.PORTFOLIO_DATA
): Promise<T> {
  const cached = cache.get(key)
  
  if (cached !== null) {
    // Return cached data immediately
    // Optionally trigger background refresh
    setTimeout(async () => {
      try {
        const fresh = await fetcher()
        cache.set(key, fresh, ttl)
      } catch (error) {
        console.error('Background refresh failed:', error)
      }
    }, 0)
    
    return cached
  }

  // No cache, fetch fresh
  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}

// Batch cache operations
export function batchInvalidate(keys: string[]): void {
  keys.forEach(key => cache.delete(key))
}

export async function batchSet(
  items: Array<{ key: string; data: any; ttl?: number }>
): Promise<void> {
  items.forEach(({ key, data, ttl = CACHE_TTL.PORTFOLIO_DATA }) => {
    cache.set(key, data, ttl)
  })
}

// Cache statistics (for monitoring)
export function getCacheStats() {
  return {
    size: (cache as any).cache.size,
    keys: Array.from((cache as any).cache.keys()),
    memory: process.memoryUsage ? process.memoryUsage() : null
  }
}
