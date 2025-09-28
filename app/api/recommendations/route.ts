import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { auth } from '@convex-dev/auth/server';

// Use environment variable or fallback
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://ceaseless-crane-697.convex.cloud';
const convex = new ConvexHttpClient(convexUrl);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const page = searchParams.get('page') || 'home';
    const locale = searchParams.get('locale') || 'en';
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get authentication token from request headers
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Verify token and get user ID
        // Note: In a real implementation, you'd verify the JWT token here
        // For now, we'll use the sessionId as a fallback
        userId = sessionId;
      } catch (error) {
        console.log('Invalid auth token:', error);
      }
    }

    // Fetch real blog posts from Convex
    let blogPosts: any[] = [];
    let projects: any[] = [];
    
        try {
          blogPosts = await convex.query(api.blog.getPublishedPosts, {
            limit: Math.min(limit, 10),
            featured: false
          }) || [];
        } catch (error) {
          console.log('No blog posts available:', error);
        }

        try {
          projects = await convex.query(api.portfolio.getProjects, {}) || [];
        } catch (error) {
          console.log('No projects available:', error);
        }

        // Use the Convex recommendations system directly
        let recommendations: any[] = [];
        
        try {
          // If user is authenticated, get personalized recommendations
          if (userId) {
            recommendations = await convex.query(api.recommendations.getRecommendations, {
              sessionId: sessionId || '',
              currentPage: page,
              locale: locale,
              limit: limit,
              userId: userId
            }) || [];
          } else {
            // Fallback to general recommendations for unauthenticated users
            recommendations = await convex.query(api.recommendations.getRecommendations, {
              sessionId: sessionId || '',
              currentPage: page,
              locale: locale,
              limit: limit
            }) || [];
          }
        } catch (error) {
          console.log('Failed to get recommendations from Convex:', error);
      
      // Fallback to manual recommendations if Convex fails
      recommendations = [
        // Blog post recommendations
        ...blogPosts.slice(0, Math.ceil(limit / 2)).map((post, index) => ({
          id: `blog-${post._id}`,
          type: 'blog_post' as const,
          title: post.titleEn || 'Untitled',
          excerpt: post.excerptEn || 'No description available',
          url: `/blog/${post.slug}`,
          score: 0.9 - (index * 0.1),
          reason: locale === 'fr' 
            ? 'Article récent basé sur vos intérêts' 
            : 'Recent article based on your interests',
          tags: post.tags || [],
          readTime: post.readTime || 5,
          category: 'Blog'
        })),
        
        // Project recommendations
        ...projects.slice(0, Math.floor(limit / 2)).map((project, index) => ({
          id: `project-${project._id}`,
          type: 'project' as const,
          title: project.titleEn || 'Untitled Project',
          excerpt: project.shortDescEn || 'No description available',
          url: `/projects/${project.slug}`,
          score: 0.85 - (index * 0.1),
          reason: locale === 'fr' 
            ? 'Projet correspondant à vos compétences' 
            : 'Project matching your skills',
          tags: project.technologies || [],
          category: 'Projects'
        }))
      ].slice(0, limit);
    }

    // Get user interests from recommendations
    let userInterests: string[] = ['Web Development', 'AI', 'React', 'Next.js', 'Full Stack'];
    
    if (recommendations && recommendations.length > 0) {
      // Extract interests from recommendation tags
      userInterests = recommendations
        .flatMap(rec => rec.tags || [])
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, 5);
    }

        return NextResponse.json({
          recommendations,
          type: userId ? 'personalized' : 'standard',
          userInterests,
          sessionId,
          page,
          locale,
          isAuthenticated: !!userId
        });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action } = body;

    // Get authentication token from request headers
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Verify token and get user ID
        // Note: In a real implementation, you'd verify the JWT token here
        // For now, we'll use the sessionId as a fallback
        userId = sessionId;
      } catch (error) {
        console.log('Invalid auth token:', error);
      }
    }

    // Store behavior tracking data in Convex
    try {
      if (userId) {
        // Use authenticated user tracking
        await convex.mutation(api.users.trackUserBehavior, {
          action: {
            type: action.type,
            page: action.page || 'unknown',
            data: action.data || {},
            ...(action.duration && { duration: action.duration }),
            ...(action.query && { query: action.query })
          }
        });
      } else {
        // Fallback to session-based tracking
        await convex.mutation(api.recommendations.trackBehavior, {
          sessionId: sessionId || '',
          action: {
            type: action.type,
            page: action.page || 'unknown',
            data: action.data || {},
            ...(action.duration && { duration: action.duration }),
            ...(action.query && { query: action.query })
          }
        });
      }
    } catch (error) {
      console.log('Failed to store behavior data:', error);
      // Continue without throwing - behavior tracking is not critical
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Behavior tracked successfully' 
    });

  } catch (error) {
    console.error('Error in behavior tracking:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}
