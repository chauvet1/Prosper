import { NextRequest, NextResponse } from 'next/server'
import PortfolioService from '@/lib/portfolio-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await PortfolioService.getProjectBySlug(params.slug)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('Project API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
