import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limiter'
import { ErrorLogger, AppError, ExternalServiceError, formatErrorResponse } from '@/lib/error-handler'
import { getCacheHeaders } from '@/lib/cache'
import aiModelManager from '@/lib/ai-model-manager'

export async function POST(request: NextRequest) {
  let locale = 'en' // default locale

  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimiters.aiAssistant.check(identifier)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatErrorResponse(new AppError('Too many AI requests, please wait before trying again', 429)),
        {
          status: 429,
          headers: rateLimiters.aiAssistant.getHeaders(identifier)
        }
      )
    }

    const requestData = await request.json()
    const { message, context, pageContext, sessionId, conversationHistory } = requestData
    locale = requestData.locale || 'en'

    // Validate required fields
    if (!message || typeof message !== 'string') {
      throw new AppError('Message is required', 400)
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use AI Model Manager for multi-model fallback

    // Context-specific information based on current page
    const contextSpecificInfo = {
      home: {
        focus: "General introduction and overview",
        capabilities: "Provide portfolio overview, highlight key services, guide to other sections",
        tone: "Welcoming and professional"
      },
      services: {
        focus: "Service details and capabilities",
        capabilities: "Explain services in detail, discuss pricing, provide examples, qualify leads",
        tone: "Professional and consultative"
      },
      projects: {
        focus: "Portfolio showcase and technical details",
        capabilities: "Discuss specific projects, explain technologies, show case studies",
        tone: "Technical but accessible"
      },
      contact: {
        focus: "Lead generation and project initiation",
        capabilities: "Qualify leads, gather requirements, schedule consultations, explain process",
        tone: "Helpful and action-oriented"
      },
      blog: {
        focus: "Content discovery and technical education",
        capabilities: "Recommend articles, explain concepts, discuss trends",
        tone: "Educational and informative"
      },
      privacy: {
        focus: "Data protection and privacy policies",
        capabilities: "Explain privacy practices, data handling, user rights",
        tone: "Clear and reassuring"
      },
      terms: {
        focus: "Service terms and legal agreements",
        capabilities: "Clarify terms, explain policies, discuss agreements",
        tone: "Clear and professional"
      },
      dashboard: {
        focus: "Administrative support and guidance",
        capabilities: "Help with interface, explain features, assist with tasks",
        tone: "Helpful and instructional"
      }
    };

    const currentPageContext = pageContext || context || 'home';
    const pageInfo = contextSpecificInfo[currentPageContext as keyof typeof contextSpecificInfo] || contextSpecificInfo.home;

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
      ? `${personalContext}\n\nCONTEXTE DE LA PAGE: ${pageInfo.focus}\nCAPACITÉS REQUISES: ${pageInfo.capabilities}\nTON: ${pageInfo.tone}\n\nRépondez en français de manière professionnelle et amicale. Aidez les visiteurs à comprendre les services offerts et comment ils peuvent bénéficier de cette expertise. Adaptez vos réponses au contexte de la page actuelle.`
      : `${personalContext}\n\nPAGE CONTEXT: ${pageInfo.focus}\nREQUIRED CAPABILITIES: ${pageInfo.capabilities}\nTONE: ${pageInfo.tone}\n\nRespond in English in a professional and friendly manner. Help visitors understand the services offered and how they can benefit from this expertise. Adapt your responses to the current page context.`

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nCONVERSATION HISTORY:\n';
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
      });
      conversationContext += '\n';
    }

    // Lead qualification logic
    const leadQualificationPrompt = `
LEAD QUALIFICATION & APPOINTMENT BOOKING INSTRUCTIONS:
- If the user shows interest in services, gently gather information about their project
- Ask qualifying questions about budget, timeline, project scope
- Identify decision-making authority and urgency
- For qualified leads, suggest scheduling a free consultation appointment
- Mention that appointments can be booked directly through the appointment scheduler
- Available times: Monday-Friday, 9 AM - 5 PM Eastern Time
- Meeting options: Video call (preferred), phone call, or in-person (Toronto area)
- Be helpful and consultative, not pushy

APPOINTMENT BOOKING TRIGGERS:
- User asks about consultation, meeting, or scheduling
- User wants to discuss their project in detail
- User is ready to move forward with a project
- User asks about availability or next steps

QUALIFICATION INDICATORS TO LOOK FOR:
- Project requirements or needs
- Budget discussions
- Timeline mentions
- Decision-making authority
- Urgency indicators
- Contact information sharing
- Appointment or meeting requests
`;

    const prompt = `${systemPrompt}${conversationContext}${leadQualificationPrompt}\n\nCurrent user question: ${message}\n\nPlease provide a helpful, informative response that addresses their question while highlighting relevant services or expertise when appropriate. Consider the conversation history to provide contextual and relevant responses. If this appears to be a qualified lead, suggest appropriate next steps. Keep responses concise but comprehensive.`

    // Use AI Model Manager with automatic fallback
    const aiResponse = await aiModelManager.generateResponse(prompt, context)
    const text = aiResponse.content

    // Lead qualification tracking (client-side only)
    const leadData = {
      sessionId,
      conversationHistory: conversationHistory || [],
      currentMessage: message,
      context: currentPageContext,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      response: text,
      leadData // Send lead data back to client for tracking
    })

  } catch (error) {
    ErrorLogger.log(error as Error, {
      locale,
      endpoint: 'ai-assistant'
    })

    // Handle specific error types
    if (error instanceof AppError) {
      return NextResponse.json(
        formatErrorResponse(error),
        { status: error.statusCode }
      )
    }

    // Handle Gemini API errors
    if (error instanceof Error && error.message.includes('API')) {
      const apiError = new ExternalServiceError('Gemini AI', 'AI service temporarily unavailable')
      return NextResponse.json(
        formatErrorResponse(apiError),
        { status: apiError.statusCode }
      )
    }

    // Fallback responses for unknown errors
    const fallbackResponses = {
      en: "I'm here to help answer questions about web development, AI solutions, mobile apps, and consulting services. Feel free to ask about specific technologies, project examples, or how I can help with your next project!",
      fr: "Je suis là pour répondre aux questions sur le développement web, les solutions IA, les applications mobiles et les services de conseil. N'hésitez pas à poser des questions sur des technologies spécifiques, des exemples de projets, ou comment je peux vous aider avec votre prochain projet !"
    }

    return NextResponse.json({
      response: fallbackResponses[locale as keyof typeof fallbackResponses] || fallbackResponses.en
    }, { status: 200 }) // Return 200 for fallback responses
  }
}
