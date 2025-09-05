import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog-service'

// GET /api/blog/posts - Get blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')
    
    let posts
    
    if (featured === 'true') {
      posts = await BlogService.getFeaturedPosts()
    } else if (limit) {
      posts = await BlogService.getRecentPosts(parseInt(limit))
    } else {
      posts = await BlogService.getPublishedPosts()
    }

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length
    })

  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog posts',
        posts: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
