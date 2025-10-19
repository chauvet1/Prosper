"use client"

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@workos-inc/authkit-nextjs/components'

interface BehaviorTrackingOptions {
  sessionId: string
  enabled?: boolean
  trackPageViews?: boolean
  trackTimeSpent?: boolean
  trackScrollDepth?: boolean
  trackInteractions?: boolean
}

export function useBehaviorTracking({
  sessionId,
  enabled = true,
  trackPageViews = true,
  trackTimeSpent = true,
  trackScrollDepth = false,
  trackInteractions = true
}: BehaviorTrackingOptions) {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const lastScrollDepthRef = useRef<number>(0)
  const trackedPagesRef = useRef<Set<string>>(new Set())
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Track behavior action
  const trackAction = useCallback(async (action: {
    type: 'page_view' | 'interaction' | 'search' | 'time_spent' | 'scroll_depth'
    page?: string
    query?: string
    duration?: number
    depth?: number
    data?: any
  }) => {
    if (!enabled || !sessionId || typeof window === 'undefined') return

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      
      // Add authentication token if user is authenticated
      if (isAuthenticated && user) {
        // WorkOS AuthKit handles authentication via cookies/session
        // No need to manually add Bearer token for API calls
        headers['X-User-ID'] = user.id
      }

      await fetch('/api/recommendations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          action
        })
      })
    } catch (error) {
      console.error('Error tracking behavior:', error)
    }
  }, [sessionId, enabled, isAuthenticated, user])

  // Track page view
  useEffect(() => {
    if (!trackPageViews || !enabled) return

    const currentPage = pathname.split('/')[1] || 'home'
    
    // Only track each page once per session
    if (!trackedPagesRef.current.has(currentPage)) {
      trackAction({
        type: 'page_view',
        page: currentPage
      })
      trackedPagesRef.current.add(currentPage)
    }

    // Reset start time for time tracking
    startTimeRef.current = Date.now()
  }, [pathname, trackAction, trackPageViews, enabled])

  // Track time spent on page
  useEffect(() => {
    if (!trackTimeSpent || !enabled) return

    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTimeRef.current
      const currentPage = pathname.split('/')[1] || 'home'
      
      // Only track if user spent more than 5 seconds on page
      if (timeSpent > 5000) {
        navigator.sendBeacon('/api/recommendations', JSON.stringify({
          sessionId,
          action: {
            type: 'time_spent',
            page: currentPage,
            duration: timeSpent
          }
        }))
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Date.now() - startTimeRef.current
        const currentPage = pathname.split('/')[1] || 'home'
        
        if (timeSpent > 5000) {
          trackAction({
            type: 'time_spent',
            page: currentPage,
            duration: timeSpent
          })
        }
      } else {
        // Reset start time when page becomes visible again
        startTimeRef.current = Date.now()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname, sessionId, trackAction, trackTimeSpent, enabled])

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth || !enabled) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100)

      // Track every 25% milestone
      const milestones = [25, 50, 75, 100]
      const currentMilestone = milestones.find(milestone => 
        scrollDepth >= milestone && lastScrollDepthRef.current < milestone
      )

      if (currentMilestone) {
        lastScrollDepthRef.current = currentMilestone
        const currentPage = pathname.split('/')[1] || 'home'
        
        trackAction({
          type: 'scroll_depth',
          page: currentPage,
          depth: currentMilestone
        })
      }
    }

    const throttledHandleScroll = throttle(handleScroll, 1000)
    window.addEventListener('scroll', throttledHandleScroll)

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [pathname, trackAction, trackScrollDepth, enabled])

  // Public methods for manual tracking
  const trackSearch = useCallback((query: string) => {
    trackAction({
      type: 'search',
      query,
      page: pathname.split('/')[1] || 'home'
    })
  }, [trackAction, pathname])

  const trackInteraction = useCallback((data: any) => {
    if (!trackInteractions) return
    
    trackAction({
      type: 'interaction',
      page: pathname.split('/')[1] || 'home',
      data
    })
  }, [trackAction, pathname, trackInteractions])

  const trackCustomAction = useCallback((action: {
    type: 'page_view' | 'interaction' | 'search' | 'time_spent'
    page?: string
    query?: string
    duration?: number
    data?: any
  }) => {
    trackAction(action)
  }, [trackAction])

  return {
    trackSearch,
    trackInteraction,
    trackCustomAction,
    isEnabled: enabled
  }
}

// Utility function to throttle scroll events
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Hook for generating session ID
export function useSessionId(): string {
  const sessionIdRef = useRef<string>('')

  if (!sessionIdRef.current) {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('behavior-session-id')
      if (stored) {
        sessionIdRef.current = stored
      } else {
        // Generate new session ID
        sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('behavior-session-id', sessionIdRef.current)
      }
    } else {
      // Server-side fallback
      sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  return sessionIdRef.current
}

// Hook for easy integration with recommendations
export function useSmartRecommendations(currentPage: string, locale: 'en' | 'fr' = 'en') {
  const sessionId = useSessionId()
  
  // Enable behavior tracking
  const { trackSearch, trackInteraction } = useBehaviorTracking({
    sessionId,
    enabled: true,
    trackPageViews: true,
    trackTimeSpent: true,
    trackInteractions: true
  })

  return {
    sessionId,
    trackSearch,
    trackInteraction,
    recommendationProps: {
      sessionId,
      currentPage,
      locale
    }
  }
}
