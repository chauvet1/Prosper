import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  let locale = 'en' // default locale

  try {
    const requestData = await request.json()
    const { message, context, pageContext, sessionId, conversationHistory } = requestData
    locale = requestData.locale || 'en'

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

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
LEAD QUALIFICATION INSTRUCTIONS:
- If the user shows interest in services, gently gather information about their project
- Ask qualifying questions about budget, timeline, project scope
- Identify decision-making authority and urgency
- Suggest next steps like consultation or project estimation
- Be helpful and consultative, not pushy

QUALIFICATION INDICATORS TO LOOK FOR:
- Project requirements or needs
- Budget discussions
- Timeline mentions
- Decision-making authority
- Urgency indicators
- Contact information sharing
`;

    const prompt = `${systemPrompt}${conversationContext}${leadQualificationPrompt}\n\nCurrent user question: ${message}\n\nPlease provide a helpful, informative response that addresses their question while highlighting relevant services or expertise when appropriate. Consider the conversation history to provide contextual and relevant responses. If this appears to be a qualified lead, suggest appropriate next steps. Keep responses concise but comprehensive.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

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
