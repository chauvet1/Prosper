import { NextRequest, NextResponse } from 'next/server'
import PortfolioService from '@/lib/portfolio-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    switch (section) {
      case 'personal':
        const personalInfo = await PortfolioService.getPersonalInfo()
        return NextResponse.json({ data: personalInfo })

      case 'skills':
        const category = searchParams.get('category')
        if (category) {
          const skills = await PortfolioService.getSkills(category)
          return NextResponse.json({ data: skills })
        } else {
          const skillsByCategory = await PortfolioService.getSkillsByCategory()
          return NextResponse.json({ data: skillsByCategory })
        }

      case 'experience':
        const experiences = await PortfolioService.getExperiences()
        return NextResponse.json({ data: experiences })

      case 'projects':
        const featured = searchParams.get('featured')
        const projects = await PortfolioService.getProjects(
          featured === 'true' ? true : featured === 'false' ? false : undefined
        )
        return NextResponse.json({ data: projects })

      case 'education':
        const education = await PortfolioService.getEducation()
        return NextResponse.json({ data: education })

      case 'certificates':
        const certificates = await PortfolioService.getCertificates()
        return NextResponse.json({ data: certificates })

      case 'analytics':
        const analytics = await PortfolioService.getPortfolioAnalytics()
        return NextResponse.json({ data: analytics })

      case 'complete':
      default:
        const completePortfolio = await PortfolioService.getCompletePortfolio()
        return NextResponse.json({ data: completePortfolio })
    }
  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, data } = body

    switch (section) {
      case 'personal':
        const updatedPersonalInfo = await PortfolioService.updatePersonalInfo(data)
        return NextResponse.json({ data: updatedPersonalInfo })

      default:
        return NextResponse.json(
          { error: 'Invalid section for update' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Portfolio update error:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio data' },
      { status: 500 }
    )
  }
}
