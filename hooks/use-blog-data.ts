"use client"

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BlogPost } from '@/lib/blog-data'

// Hook for fetching blog posts using Convex
export function useBlogPosts(options?: { limit?: number; featured?: boolean }) {
  const posts = useQuery(api.blog.getPublishedPosts, {
    limit: options?.limit,
    featured: options?.featured,
  });

  return {
    posts: posts || [],
    loading: posts === undefined,
    error: null,
    refetch: () => {} // Convex handles refetching automatically
  };
}

// Hook for fetching a specific blog post by ID
export function useBlogPost(id: string) {
  const post = useQuery(api.blog.getPostById, { id: id as any });

  return {
    post: post || null,
    loading: post === undefined,
    error: null,
    refetch: () => {} // Convex handles refetching automatically
  };
}

// Hook for fetching a specific blog post by slug
export function useBlogPostBySlug(slug: string) {
  const post = useQuery(api.blog.getPostBySlug, { slug });

  return {
    post: post || null,
    loading: post === undefined,
    error: null,
    refetch: () => {} // Convex handles refetching automatically
  };
}

// Hook for featured posts
export function useFeaturedPosts() {
  return useBlogPosts({ featured: true })
}

// Hook for recent posts
export function useRecentPosts(limit: number = 3) {
  return useBlogPosts({ limit })
}
