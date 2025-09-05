"use client"

import { useState, useEffect } from 'react'
import { BlogPost } from '@/lib/blog-data'

interface BlogResponse {
  success: boolean
  posts: BlogPost[]
  count: number
  error?: string
}

interface PostResponse {
  success: boolean
  post: BlogPost | null
  error?: string
}

// Hook for fetching blog posts
export function useBlogPosts(options?: { limit?: number; featured?: boolean }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options?.limit) params.set('limit', options.limit.toString())
        if (options?.featured) params.set('featured', 'true')

        const response = await fetch(`/api/blog/posts?${params}`)
        const data: BlogResponse = await response.json()

        if (data.success) {
          setPosts(data.posts)
        } else {
          setError(data.error || 'Failed to fetch posts')
        }
      } catch (err) {
        setError('Network error while fetching posts')
        console.error('Error fetching blog posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [options?.limit, options?.featured])

  return { posts, loading, error, refetch: () => fetchPosts() }
}

// Hook for fetching a specific blog post
export function useBlogPost(id: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/blog/posts/${id}`)
        const data: PostResponse = await response.json()

        if (data.success) {
          setPost(data.post)
        } else {
          setError(data.error || 'Failed to fetch post')
        }
      } catch (err) {
        setError('Network error while fetching post')
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  return { post, loading, error, refetch: () => fetchPost() }
}

// Hook for featured posts
export function useFeaturedPosts() {
  return useBlogPosts({ featured: true })
}

// Hook for recent posts
export function useRecentPosts(limit: number = 3) {
  return useBlogPosts({ limit })
}

// Client-side utility functions that use the hooks
export async function getFeaturedPostsClient(): Promise<BlogPost[]> {
  try {
    const response = await fetch('/api/blog/posts?featured=true')
    const data: BlogResponse = await response.json()
    return data.success ? data.posts : []
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }
}

export async function getRecentPostsClient(limit: number = 3): Promise<BlogPost[]> {
  try {
    const response = await fetch(`/api/blog/posts?limit=${limit}`)
    const data: BlogResponse = await response.json()
    return data.success ? data.posts : []
  } catch (error) {
    console.error('Error fetching recent posts:', error)
    return []
  }
}

export async function getPostByIdClient(id: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/posts/${id}`)
    const data: PostResponse = await response.json()
    return data.success ? data.post : null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}
