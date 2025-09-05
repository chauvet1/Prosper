import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog-service'

// GET /api/blog/posts/[id] - Get a specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await BlogService.getPostById(id)
    
    if (!post) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Blog post not found',
          post: null
        },
        { status: 404 }
      )
    }

    // Get images for this post
    const images = await BlogService.getPostImages(id)

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        images
      }
    })

  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog post',
        post: null
      },
      { status: 500 }
    )
  }
}
