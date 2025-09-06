import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, locale, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Personal context about you - customize this with your actual information
    const personalContext = `
You are an AI assistant representing a professional developer/entrepreneur. Here's information about them:

SERVICES OFFERED:
- Custom Web Development (React, Next.js, Node.js, TypeScript)
- AI & Machine Learning Solutions (Custom AI integrations, chatbots, automation)
- Mobile App Development (React Native, iOS/Android)
- UI/UX Design (Modern, accessible interfaces)
- Tech Consulting (Strategy, scaling, optimization)
- Process Automation (Workflow optimization, efficiency improvements)

EXPERIENCE & EXPERTISE:
- Full-stack web development with modern technologies
- AI integration and machine learning implementations
- Mobile app development for iOS and Android
- Database design and optimization (PostgreSQL, MongoDB)
- Cloud deployment and DevOps (AWS, Vercel, Docker)
- API development and third-party integrations
- Performance optimization and scalability

RECENT PROJECTS:
- AI-powered blog platform with DALL-E 3 image generation
- Custom CRM systems with automation
- E-commerce platforms with payment integrations
- Mobile apps with real-time features
- AI chatbots and virtual assistants

APPROACH:
- Focus on modern, scalable solutions
- Emphasis on user experience and performance
- Agile development methodology
- Strong communication and project management
- Competitive pricing with high-quality deliverables

CONTACT:
- Available for consultations and project discussions
- Flexible engagement models (project-based, hourly, retainer)
- Quick response times and regular updates
- Portfolio and case studies available upon request

Please respond as this professional's AI assistant, providing helpful information about their services, experience, and how they can help potential clients. Be friendly, professional, and informative.
`

    const systemPrompt = locale === 'fr' 
      ? `${personalContext}\n\nRépondez en français de manière professionnelle et amicale. Aidez les visiteurs à comprendre les services offerts et comment ils peuvent bénéficier de cette expertise.`
      : `${personalContext}\n\nRespond in English in a professional and friendly manner. Help visitors understand the services offered and how they can benefit from this expertise.`

    const prompt = `${systemPrompt}\n\nUser question: ${message}\n\nPlease provide a helpful, informative response that addresses their question while highlighting relevant services or expertise when appropriate. Keep responses concise but comprehensive.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })

  } catch (error) {
    console.error('AI Assistant error:', error)
    
    // Fallback responses
    const fallbackResponses = {
      en: "I'm here to help answer questions about web development, AI solutions, mobile apps, and consulting services. Feel free to ask about specific technologies, project examples, or how I can help with your next project!",
      fr: "Je suis là pour répondre aux questions sur le développement web, les solutions IA, les applications mobiles et les services de conseil. N'hésitez pas à poser des questions sur des technologies spécifiques, des exemples de projets, ou comment je peux vous aider avec votre prochain projet !"
    }

    return NextResponse.json({ 
      response: fallbackResponses[locale as keyof typeof fallbackResponses] || fallbackResponses.en 
    })
  }
}
