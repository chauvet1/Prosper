import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { requirements, locale } = await request.json()

    if (!requirements) {
      return NextResponse.json(
        { error: 'Project requirements are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const estimationPrompt = locale === 'fr' 
      ? `Vous êtes un expert en estimation de projets de développement logiciel. Analysez les exigences suivantes et fournissez une estimation détaillée.

EXIGENCES DU PROJET:
Type de projet: ${requirements.projectType}
Description: ${requirements.description}
Fonctionnalités: ${requirements.features.join(', ')}
Délai souhaité: ${requirements.timeline}
Budget: ${requirements.budget}
Complexité: ${requirements.complexity}
Plateformes: ${requirements.platforms.join(', ')}
Besoins de design: ${requirements.designNeeds}
Maintenance: ${requirements.maintenanceNeeds}

Fournissez une estimation au format JSON avec:
{
  "estimatedCost": {"min": number, "max": number},
  "estimatedTimeline": {"min": number, "max": number},
  "recommendedTech": ["tech1", "tech2"],
  "projectPhases": [{"phase": "nom", "duration": "durée", "description": "description"}],
  "considerations": ["considération1", "considération2"],
  "nextSteps": ["étape1", "étape2"]
}

Basez vos estimations sur les tarifs du marché actuel et les meilleures pratiques de l'industrie.`
      : `You are an expert software development project estimator. Analyze the following requirements and provide a detailed estimate.

PROJECT REQUIREMENTS:
Project Type: ${requirements.projectType}
Description: ${requirements.description}
Features: ${requirements.features.join(', ')}
Desired Timeline: ${requirements.timeline}
Budget: ${requirements.budget}
Complexity: ${requirements.complexity}
Platforms: ${requirements.platforms.join(', ')}
Design Needs: ${requirements.designNeeds}
Maintenance: ${requirements.maintenanceNeeds}

Provide an estimate in JSON format with:
{
  "estimatedCost": {"min": number, "max": number},
  "estimatedTimeline": {"min": number, "max": number},
  "recommendedTech": ["tech1", "tech2"],
  "projectPhases": [{"phase": "name", "duration": "duration", "description": "description"}],
  "considerations": ["consideration1", "consideration2"],
  "nextSteps": ["step1", "step2"]
}

Base your estimates on current market rates and industry best practices.`

    const result = await model.generateContent(estimationPrompt)
    const response = result.response
    const text = response.text()

    // Try to parse the JSON response
    let estimate
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        estimate = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      
      // Fallback estimate based on requirements
      estimate = generateFallbackEstimate(requirements, locale)
    }

    return NextResponse.json({ estimate })

  } catch (error) {
    console.error('Project estimation error:', error)
    
    // Return fallback estimate
    const fallbackEstimate = generateFallbackEstimate(
      request.body ? JSON.parse(await request.text()).requirements : {}, 
      request.body ? JSON.parse(await request.text()).locale : 'en'
    )
    
    return NextResponse.json({ estimate: fallbackEstimate })
  }
}

function generateFallbackEstimate(requirements: any, locale: string) {
  // Real market-based estimation logic
  let baseCost = 3500 // Updated base cost for 2024 market rates
  let baseTimeline = 6 // weeks

  // Adjust based on project type with real market data
  switch (requirements.projectType) {
    case 'landing-page':
      baseCost = 1500
      baseTimeline = 2
      break
    case 'business-website':
      baseCost = 3500
      baseTimeline = 4
      break
    case 'web-application':
      baseCost = 8000
      baseTimeline = 8
      break
    case 'mobile-app':
      baseCost = 12000
      baseTimeline = 12
      break
    case 'e-commerce':
      baseCost = 15000
      baseTimeline = 10
      break
    case 'ai-integration':
      baseCost = 10000
      baseTimeline = 8
      break
    case 'blockchain':
      baseCost = 20000
      baseTimeline = 16
      break
    case 'ai-solution':
      baseCost = 18000
      baseTimeline = 14
      break
    case 'enterprise':
      baseCost = 35000
      baseTimeline = 20
      break
  }

  // Adjust based on complexity
  switch (requirements.complexity) {
    case 'simple':
      baseCost *= 0.7
      baseTimeline *= 0.8
      break
    case 'moderate':
      // base values
      break
    case 'complex':
      baseCost *= 1.5
      baseTimeline *= 1.4
      break
    case 'enterprise':
      baseCost *= 2.5
      baseTimeline *= 2
      break
  }

  // Adjust based on features count
  const featureMultiplier = 1 + (requirements.features?.length || 0) * 0.1
  baseCost *= featureMultiplier
  baseTimeline *= Math.min(featureMultiplier, 1.5)

  // Adjust based on platforms
  const platformMultiplier = 1 + (requirements.platforms?.length || 1) * 0.2
  baseCost *= platformMultiplier
  baseTimeline *= Math.min(platformMultiplier, 1.3)

  const estimate = {
    estimatedCost: {
      min: Math.round(baseCost * 0.8),
      max: Math.round(baseCost * 1.4)
    },
    estimatedTimeline: {
      min: Math.round(baseTimeline * 0.8),
      max: Math.round(baseTimeline * 1.3)
    },
    recommendedTech: getRecommendedTech(requirements.projectType),
    projectPhases: getProjectPhases(locale),
    considerations: getConsiderations(locale),
    nextSteps: getNextSteps(locale)
  }

  return estimate
}

function getRecommendedTech(projectType: string): string[] {
  const techStacks: { [key: string]: string[] } = {
    'landing-page': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    'business-website': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'],
    'web-application': ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'],
    'mobile-app': ['React Native', 'TypeScript', 'Expo', 'Supabase', 'Firebase'],
    'e-commerce': ['Next.js', 'Stripe', 'Supabase', 'TypeScript', 'Tailwind CSS'],
    'ai-integration': ['Next.js', 'OpenAI API', 'TypeScript', 'Supabase', 'Python'],
    'blockchain': ['Next.js', 'Web3.js', 'Solidity', 'TypeScript', 'Hardhat'],
    'ai-solution': ['Python', 'FastAPI', 'OpenAI', 'Supabase', 'Docker'],
    'enterprise': ['Next.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    'default': ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS']
  }

  return techStacks[projectType] || techStacks.default
}

function getProjectPhases(locale: string) {
  return locale === 'fr' ? [
    {
      phase: "Planification & Design",
      duration: "2-3 semaines",
      description: "Analyse des exigences et conception UI/UX"
    },
    {
      phase: "Développement",
      duration: "6-10 semaines",
      description: "Développement principal et implémentation des fonctionnalités"
    },
    {
      phase: "Tests & Déploiement",
      duration: "1-2 semaines",
      description: "Assurance qualité et déploiement en production"
    }
  ] : [
    {
      phase: "Planning & Design",
      duration: "2-3 weeks",
      description: "Requirements analysis and UI/UX design"
    },
    {
      phase: "Development",
      duration: "6-10 weeks",
      description: "Core development and feature implementation"
    },
    {
      phase: "Testing & Deployment",
      duration: "1-2 weeks",
      description: "Quality assurance and production deployment"
    }
  ]
}

function getConsiderations(locale: string): string[] {
  return locale === 'fr' ? [
    "Le délai peut varier selon les cycles de feedback",
    "Des fonctionnalités supplémentaires peuvent augmenter le coût",
    "Les intégrations tierces peuvent nécessiter du temps supplémentaire",
    "Les révisions de design peuvent affecter le planning"
  ] : [
    "Timeline may vary based on feedback cycles",
    "Additional features may increase cost",
    "Third-party integrations may require additional time",
    "Design revisions may affect timeline"
  ]
}

function getNextSteps(locale: string): string[] {
  return locale === 'fr' ? [
    "Planifier une consultation détaillée",
    "Finaliser les exigences du projet",
    "Créer un planning de projet détaillé",
    "Commencer le processus de développement"
  ] : [
    "Schedule a detailed consultation",
    "Finalize project requirements",
    "Create detailed project timeline",
    "Begin development process"
  ]
}
