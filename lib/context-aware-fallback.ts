// Context-Aware Fallback Response System
// Provides intelligent, context-specific fallback responses when AI services are unavailable

import { ErrorLogger } from './error-handler'

export interface FallbackContext {
  pageContext?: string
  userIntent?: string
  conversationHistory?: Array<{ role: string; content: string }>
  locale?: 'en' | 'fr'
  userType?: 'visitor' | 'client' | 'developer'
  sessionId?: string
  timestamp: number
}

export interface FallbackResponse {
  content: string
  confidence: number
  context: string
  suggestedActions?: string[]
  fallbackReason: string
}

export interface FallbackTemplate {
  id: string
  context: string
  intent: string
  responses: {
    en: string
    fr: string
  }
  confidence: number
  suggestedActions?: string[]
}

class ContextAwareFallback {
  private templates: Map<string, FallbackTemplate[]> = new Map()
  private conversationMemory: Map<string, Array<{ role: string; content: string; timestamp: number }>> = new Map()
  private userProfiles: Map<string, { type: string; preferences: Record<string, any> }> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  /**
   * Generate context-aware fallback response
   */
  public generateFallbackResponse(
    userMessage: string,
    context: FallbackContext
  ): FallbackResponse {
    try {
      // Analyze user intent and context
      const intent = this.analyzeIntent(userMessage, context)
      const userType = this.determineUserType(context)
      const locale = context.locale || 'en'

      // Get relevant templates
      const relevantTemplates = this.getRelevantTemplates(intent, context.pageContext, userType)
      
      // Select best template
      const selectedTemplate = this.selectBestTemplate(relevantTemplates, context)
      
      // Generate response
      const response = this.generateResponse(selectedTemplate, context, locale)
      
      // Update conversation memory
      this.updateConversationMemory(context.sessionId || 'default', userMessage, 'user')
      this.updateConversationMemory(context.sessionId || 'default', response.content, 'assistant')

      ErrorLogger.logInfo('Context-aware fallback response generated', {
        intent,
        userType,
        locale,
        templateId: selectedTemplate?.id,
        confidence: response.confidence
      })

      return response

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'context-aware-fallback' })
      
      // Return basic fallback
      return this.getBasicFallback(context.locale || 'en')
    }
  }

  /**
   * Analyze user intent from message and context
   */
  private analyzeIntent(message: string, context: FallbackContext): string {
    const lowerMessage = message.toLowerCase()
    
    // Intent patterns
    const intentPatterns = {
      'greeting': ['hello', 'hi', 'bonjour', 'salut', 'hey', 'good morning', 'good afternoon'],
      'services': ['services', 'what do you do', 'what can you help', 'development', 'web development', 'mobile app'],
      'portfolio': ['portfolio', 'projects', 'work', 'examples', 'show me', 'what have you built'],
      'contact': ['contact', 'get in touch', 'email', 'phone', 'meeting', 'consultation', 'appointment'],
      'pricing': ['price', 'cost', 'how much', 'budget', 'estimate', 'quote', 'pricing'],
      'blog': ['blog', 'articles', 'posts', 'content', 'writing', 'blog post'],
      'technical': ['technical', 'code', 'programming', 'technology', 'stack', 'framework'],
      'about': ['about', 'who are you', 'tell me about', 'background', 'experience'],
      'help': ['help', 'support', 'assistance', 'how to', 'can you help', 'what should i do']
    }

    // Check for intent patterns
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        return intent
      }
    }

    // Check conversation history for context
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const lastMessage = context.conversationHistory[context.conversationHistory.length - 1]
      if (lastMessage.role === 'assistant') {
        // If last message was from assistant, user might be responding
        return 'follow_up'
      }
    }

    // Check page context
    if (context.pageContext) {
      switch (context.pageContext) {
        case 'home':
          return 'general_inquiry'
        case 'services':
          return 'services'
        case 'portfolio':
          return 'portfolio'
        case 'blog':
          return 'blog'
        case 'contact':
          return 'contact'
        default:
          return 'general_inquiry'
      }
    }

    return 'general_inquiry'
  }

  /**
   * Determine user type from context
   */
  private determineUserType(context: FallbackContext): string {
    // Check if user profile exists
    if (context.sessionId) {
      const profile = this.userProfiles.get(context.sessionId)
      if (profile) {
        return profile.type
      }
    }

    // Analyze message for user type indicators
    const message = context.conversationHistory?.[0]?.content || ''
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('developer') || lowerMessage.includes('programmer') || lowerMessage.includes('coding')) {
      return 'developer'
    }
    
    if (lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('startup')) {
      return 'client'
    }

    if (lowerMessage.includes('student') || lowerMessage.includes('learning') || lowerMessage.includes('tutorial')) {
      return 'student'
    }

    return 'visitor'
  }

  /**
   * Get relevant templates based on intent and context
   */
  private getRelevantTemplates(intent: string, pageContext?: string, userType?: string): FallbackTemplate[] {
    const templates: FallbackTemplate[] = []

    // Get templates for the intent
    const intentTemplates = this.templates.get(intent) || []
    templates.push(...intentTemplates)

    // Get templates for page context
    if (pageContext) {
      const pageTemplates = this.templates.get(pageContext) || []
      templates.push(...pageTemplates)
    }

    // Get templates for user type
    if (userType) {
      const userTemplates = this.templates.get(userType) || []
      templates.push(...userTemplates)
    }

    // Remove duplicates
    const uniqueTemplates = templates.filter((template, index, self) => 
      index === self.findIndex(t => t.id === template.id)
    )

    return uniqueTemplates
  }

  /**
   * Select the best template based on context
   */
  private selectBestTemplate(templates: FallbackTemplate[], context: FallbackContext): FallbackTemplate {
    if (templates.length === 0) {
      return this.getDefaultTemplate()
    }

    // Score templates based on relevance
    const scoredTemplates = templates.map(template => ({
      template,
      score: this.scoreTemplate(template, context)
    }))

    // Sort by score and return the best one
    scoredTemplates.sort((a, b) => b.score - a.score)
    return scoredTemplates[0].template
  }

  /**
   * Score template based on context relevance
   */
  private scoreTemplate(template: FallbackTemplate, context: FallbackContext): number {
    let score = template.confidence

    // Boost score for exact context match
    if (template.context === context.pageContext) {
      score += 0.3
    }

    // Boost score for user type match
    if (template.context === context.userType) {
      score += 0.2
    }

    // Boost score for locale match
    if (context.locale && template.responses[context.locale]) {
      score += 0.1
    }

    return score
  }

  /**
   * Generate response from template
   */
  private generateResponse(template: FallbackTemplate, context: FallbackContext, locale: 'en' | 'fr'): FallbackResponse {
    const content = template.responses[locale] || template.responses.en
    
    return {
      content,
      confidence: template.confidence,
      context: template.context,
      suggestedActions: template.suggestedActions,
      fallbackReason: 'AI service unavailable - using context-aware fallback'
    }
  }

  /**
   * Update conversation memory
   */
  private updateConversationMemory(sessionId: string, content: string, role: 'user' | 'assistant'): void {
    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, [])
    }

    const memory = this.conversationMemory.get(sessionId)!
    memory.push({
      role,
      content,
      timestamp: Date.now()
    })

    // Keep only last 10 messages
    if (memory.length > 10) {
      memory.splice(0, memory.length - 10)
    }
  }

  /**
   * Get basic fallback response
   */
  private getBasicFallback(locale: 'en' | 'fr'): FallbackResponse {
    const responses = {
      en: "I'm currently experiencing technical difficulties with my AI assistant. Please feel free to browse my portfolio, check out my blog posts, or contact me directly. I'll be happy to help you with your web development needs!",
      fr: "Je rencontre actuellement des difficultés techniques avec mon assistant IA. N'hésitez pas à parcourir mon portfolio, consulter mes articles de blog ou me contacter directement. Je serai ravi de vous aider avec vos besoins de développement web !"
    }

    return {
      content: responses[locale],
      confidence: 0.5,
      context: 'basic_fallback',
      suggestedActions: ['Browse portfolio', 'Read blog', 'Contact directly'],
      fallbackReason: 'AI service unavailable - using basic fallback'
    }
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(): FallbackTemplate {
    return {
      id: 'default',
      context: 'general',
      intent: 'general_inquiry',
      responses: {
        en: "I'm here to help with your web development needs. While my AI assistant is temporarily unavailable, you can explore my portfolio, read my blog posts, or contact me directly for personalized assistance.",
        fr: "Je suis là pour vous aider avec vos besoins de développement web. Bien que mon assistant IA soit temporairement indisponible, vous pouvez explorer mon portfolio, lire mes articles de blog ou me contacter directement pour une assistance personnalisée."
      },
      confidence: 0.7,
      suggestedActions: ['Explore portfolio', 'Read blog', 'Contact me']
    }
  }

  /**
   * Initialize fallback templates
   */
  private initializeTemplates(): void {
    // Greeting templates
    this.templates.set('greeting', [
      {
        id: 'greeting_visitor',
        context: 'visitor',
        intent: 'greeting',
        responses: {
          en: "Hello! Welcome to my portfolio. I'm a full-stack developer specializing in modern web applications. While my AI assistant is temporarily unavailable, feel free to explore my work or contact me directly!",
          fr: "Bonjour ! Bienvenue sur mon portfolio. Je suis un développeur full-stack spécialisé dans les applications web modernes. Bien que mon assistant IA soit temporairement indisponible, n'hésitez pas à explorer mon travail ou à me contacter directement !"
        },
        confidence: 0.9,
        suggestedActions: ['View portfolio', 'Read about me', 'Contact me']
      }
    ])

    // Services templates
    this.templates.set('services', [
      {
        id: 'services_overview',
        context: 'services',
        intent: 'services',
        responses: {
          en: "I offer comprehensive web development services including React/Next.js applications, Node.js backends, mobile apps, and AI integrations. While my AI assistant is unavailable, you can view my detailed services page or contact me for a personalized consultation.",
          fr: "J'offre des services complets de développement web incluant des applications React/Next.js, des backends Node.js, des applications mobiles et des intégrations IA. Bien que mon assistant IA soit indisponible, vous pouvez consulter ma page de services détaillée ou me contacter pour une consultation personnalisée."
        },
        confidence: 0.9,
        suggestedActions: ['View services', 'See portfolio', 'Get quote']
      }
    ])

    // Portfolio templates
    this.templates.set('portfolio', [
      {
        id: 'portfolio_showcase',
        context: 'portfolio',
        intent: 'portfolio',
        responses: {
          en: "I've worked on various projects including e-commerce platforms, SaaS applications, and mobile apps. While my AI assistant is temporarily unavailable, you can browse my portfolio to see detailed case studies and live demos.",
          fr: "J'ai travaillé sur divers projets incluant des plateformes e-commerce, des applications SaaS et des applications mobiles. Bien que mon assistant IA soit temporairement indisponible, vous pouvez parcourir mon portfolio pour voir des études de cas détaillées et des démos en direct."
        },
        confidence: 0.9,
        suggestedActions: ['Browse projects', 'View case studies', 'See live demos']
      }
    ])

    // Contact templates
    this.templates.set('contact', [
      {
        id: 'contact_info',
        context: 'contact',
        intent: 'contact',
        responses: {
          en: "I'd love to hear about your project! While my AI assistant is temporarily unavailable, you can reach me directly via email or schedule a consultation. I typically respond within 24 hours and offer free initial consultations.",
          fr: "J'aimerais entendre parler de votre projet ! Bien que mon assistant IA soit temporairement indisponible, vous pouvez me joindre directement par email ou planifier une consultation. Je réponds généralement dans les 24 heures et j'offre des consultations initiales gratuites."
        },
        confidence: 0.9,
        suggestedActions: ['Send email', 'Schedule call', 'Get quote']
      }
    ])

    // Pricing templates
    this.templates.set('pricing', [
      {
        id: 'pricing_info',
        context: 'client',
        intent: 'pricing',
        responses: {
          en: "Project costs vary based on complexity, timeline, and requirements. While my AI assistant is temporarily unavailable, I can provide you with a detailed estimate. Contact me with your project details for a personalized quote.",
          fr: "Les coûts de projet varient selon la complexité, le délai et les exigences. Bien que mon assistant IA soit temporairement indisponible, je peux vous fournir une estimation détaillée. Contactez-moi avec les détails de votre projet pour un devis personnalisé."
        },
        confidence: 0.8,
        suggestedActions: ['Get estimate', 'Schedule consultation', 'View pricing guide']
      }
    ])

    // Technical templates
    this.templates.set('technical', [
      {
        id: 'technical_expertise',
        context: 'developer',
        intent: 'technical',
        responses: {
          en: "I specialize in modern web technologies including React, Next.js, Node.js, TypeScript, and various databases. While my AI assistant is temporarily unavailable, you can check out my blog for technical articles or contact me for technical discussions.",
          fr: "Je me spécialise dans les technologies web modernes incluant React, Next.js, Node.js, TypeScript et diverses bases de données. Bien que mon assistant IA soit temporairement indisponible, vous pouvez consulter mon blog pour des articles techniques ou me contacter pour des discussions techniques."
        },
        confidence: 0.9,
        suggestedActions: ['Read technical blog', 'View GitHub', 'Discuss technology']
      }
    ])

    // Blog templates
    this.templates.set('blog', [
      {
        id: 'blog_content',
        context: 'blog',
        intent: 'blog',
        responses: {
          en: "I write about web development, AI integration, and modern programming practices. While my AI assistant is temporarily unavailable, you can browse my blog posts, subscribe to updates, or contact me if you have specific questions about my articles.",
          fr: "J'écris sur le développement web, l'intégration IA et les pratiques de programmation modernes. Bien que mon assistant IA soit temporairement indisponible, vous pouvez parcourir mes articles de blog, vous abonner aux mises à jour ou me contacter si vous avez des questions spécifiques sur mes articles."
        },
        confidence: 0.9,
        suggestedActions: ['Browse articles', 'Subscribe to updates', 'Contact about content']
      }
    ])
  }

  /**
   * Get conversation history for a session
   */
  public getConversationHistory(sessionId: string): Array<{ role: string; content: string; timestamp: number }> {
    return this.conversationMemory.get(sessionId) || []
  }

  /**
   * Clear conversation history for a session
   */
  public clearConversationHistory(sessionId: string): void {
    this.conversationMemory.delete(sessionId)
  }

  /**
   * Update user profile
   */
  public updateUserProfile(sessionId: string, type: string, preferences: Record<string, any>): void {
    this.userProfiles.set(sessionId, { type, preferences })
  }

  /**
   * Get user profile
   */
  public getUserProfile(sessionId: string): { type: string; preferences: Record<string, any> } | null {
    return this.userProfiles.get(sessionId) || null
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalTemplates: number
    activeSessions: number
    totalConversations: number
  } {
    const totalTemplates = Array.from(this.templates.values()).reduce((sum, templates) => sum + templates.length, 0)
    const activeSessions = this.conversationMemory.size
    const totalConversations = Array.from(this.conversationMemory.values()).reduce((sum, memory) => sum + memory.length, 0)

    return {
      totalTemplates,
      activeSessions,
      totalConversations
    }
  }
}

// Singleton instance
export const contextAwareFallback = new ContextAwareFallback()

// Export types and class
export { ContextAwareFallback }
export type { FallbackContext, FallbackResponse, FallbackTemplate }
