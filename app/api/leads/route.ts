import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      message,
      projectRequirements,
      estimate,
      source,
      locale
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        message: message || null,
        projectRequirements: projectRequirements ? JSON.stringify(projectRequirements) : null,
        estimate: estimate ? JSON.stringify(estimate) : null,
        source: source || 'website',
        locale: locale || 'en',
        status: 'NEW',
        priority: 'MEDIUM',
        leadScore: calculateLeadScore({
          hasPhone: !!phone,
          hasCompany: !!company,
          hasMessage: !!message,
          hasEstimate: !!estimate,
          estimateValue: estimate?.estimatedCost?.max || 0
        })
      }
    })

    // Send notification email (in a real app, you'd use a service like SendGrid)
    console.log('New lead captured:', {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      source: lead.source,
      leadScore: lead.leadScore
    })

    // You could also trigger webhooks, CRM integrations, etc. here

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: locale === 'fr' 
        ? 'Votre demande a été envoyée avec succès!'
        : 'Your request has been sent successfully!'
    })

  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { leadScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.lead.count({ where })

    return NextResponse.json({
      leads,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

function calculateLeadScore(data: {
  hasPhone: boolean
  hasCompany: boolean
  hasMessage: boolean
  hasEstimate: boolean
  estimateValue: number
}): number {
  let score = 0

  // Base score for having contact info
  score += 2

  // Additional points for completeness
  if (data.hasPhone) score += 1
  if (data.hasCompany) score += 2
  if (data.hasMessage) score += 1
  if (data.hasEstimate) score += 2

  // Points based on project value
  if (data.estimateValue > 50000) score += 3
  else if (data.estimateValue > 20000) score += 2
  else if (data.estimateValue > 10000) score += 1

  return Math.min(score, 10) // Cap at 10
}
