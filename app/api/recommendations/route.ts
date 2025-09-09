import { NextRequest, NextResponse } from 'next/server'
import recommendationEngine from '@/lib/recommendation-engine'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'
import { ErrorLogger, AppError, formatErrorResponse } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.api.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.api.getHeaders(identifier)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const currentPage = searchParams.get('page') || 'home'
    const locale = (searchParams.get('locale') || 'en') as 'en' | 'fr'
    const limit = parseInt(searchParams.get('limit') || '6')
    const type = searchParams.get('type') // 'standard' or 'ai'

    if (!sessionId) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Session ID is required', 400)),
        { status: 400 }
      )
    }

    // Get user behavior
    const userBehavior = recommendationEngine.getUserBehavior(sessionId)
    
    if (!userBehavior) {
      // Return default recommendations for new users
      const defaultRecommendations = await getDefaultRecommendations(locale, currentPage, limit)
      return NextResponse.json({
        recommendations: defaultRecommendations,
        type: 'default',
        sessionId
      })
    }

    const context = {
      currentPage,
      userBehavior,
      locale,
      limit
    }

    let recommendations
    if (type === 'ai') {
      // Get AI-powered recommendations
      recommendations = await recommendationEngine.getAIRecommendations(context)
    } else {
      // Get standard algorithm-based recommendations
      recommendations = await recommendationEngine.getRecommendations(context)
    }

    return NextResponse.json({
      recommendations,
      type: type || 'standard',
      sessionId,
      userInterests: userBehavior.interests,
      behaviorSummary: {
        pageViews: userBehavior.pageViews.length,
        searchQueries: userBehavior.searchQueries.length,
        interests: userBehavior.interests.length
      }
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'recommendations'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.api.check(identifier)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many requests, please try again later', 429)),
        { 
          status: 429,
          headers: rateLimiters.api.getHeaders(identifier)
        }
      )
    }

    const body = await request.json()
    const { sessionId, action } = body

    if (!sessionId || !action) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Session ID and action are required', 400)),
        { status: 400 }
      )
    }

    // Track user behavior
    await recommendationEngine.trackBehavior(sessionId, action)

    return NextResponse.json({
      success: true,
      message: 'Behavior tracked successfully',
      sessionId
    })

  } catch (error) {
    ErrorLogger.log(error as Error, { 
      endpoint: 'recommendations-track'
    })
    
    return NextResponse.json(
      formatErrorResponse(error as Error),
      { status: 500 }
    )
  }
}

// Helper function for default recommendations
async function getDefaultRecommendations(locale: 'en' | 'fr', currentPage: string, limit: number) {
  const defaultRecs = [
    {
      id: 'default-web-dev',
      type: 'service' as const,
      title: locale === 'fr' ? 'Développement Web Moderne' : 'Modern Web Development',
      excerpt: locale === 'fr' 
        ? 'Créez des applications web performantes avec les dernières technologies'
        : 'Build high-performance web applications with the latest technologies',
      url: '/services',
      score: 80,
      reason: locale === 'fr' ? 'Service populaire' : 'Popular service',
      tags: ['web-development', 'react', 'nextjs'],
      category: 'service'
    },
    {
      id: 'default-ai-solutions',
      type: 'service' as const,
      title: locale === 'fr' ? 'Solutions IA Innovantes' : 'Innovative AI Solutions',
      excerpt: locale === 'fr'
        ? 'Intégrez l\'intelligence artificielle dans vos processus métier'
        : 'Integrate artificial intelligence into your business processes',
      url: '/services',
      score: 75,
      reason: locale === 'fr' ? 'Technologie émergente' : 'Emerging technology',
      tags: ['ai', 'automation', 'innovation'],
      category: 'service'
    },
    {
      id: 'default-portfolio',
      type: 'project' as const,
      title: locale === 'fr' ? 'Découvrez Nos Projets' : 'Explore Our Projects',
      excerpt: locale === 'fr'
        ? 'Parcourez notre portfolio de projets web et mobiles réalisés'
        : 'Browse our portfolio of completed web and mobile projects',
      url: '/projects',
      score: 70,
      reason: locale === 'fr' ? 'Exemples de réalisations' : 'Work examples',
      tags: ['portfolio', 'projects', 'showcase'],
      category: 'project'
    },
    {
      id: 'default-consultation',
      type: 'service' as const,
      title: locale === 'fr' ? 'Consultation Gratuite' : 'Free Consultation',
      excerpt: locale === 'fr'
        ? 'Discutez de votre projet avec nos experts techniques'
        : 'Discuss your project with our technical experts',
      url: '/contact',
      score: 65,
      reason: locale === 'fr' ? 'Première étape recommandée' : 'Recommended first step',
      tags: ['consultation', 'contact', 'planning'],
      category: 'service'
    }
  ]

  // Adjust scores based on current page
  if (currentPage === 'services') {
    defaultRecs.forEach(rec => {
      if (rec.type === 'service') rec.score += 10
    })
  } else if (currentPage === 'projects') {
    defaultRecs.forEach(rec => {
      if (rec.type === 'project') rec.score += 10
    })
  }

  return defaultRecs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
