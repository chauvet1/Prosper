// Multi-model AI manager with automatic fallback and quota management
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ErrorLogger, CircuitBreaker, AIResponseError } from './error-handler'

export interface AIModel {
  id: string
  name: string
  provider: 'gemini' | 'openai' | 'anthropic' | 'local'
  model: string
  apiKey?: string
  endpoint?: string
  maxTokens: number
  costPerToken: number
  quotaLimit: number
  quotaUsed: number
  quotaResetTime: number
  priority: number // Lower number = higher priority
  isAvailable: boolean
  lastError?: string
  circuitBreaker: CircuitBreaker
}

export interface AIResponse {
  content: string
  model: string
  tokensUsed: number
  cost: number
  responseTime: number
}

class AIModelManager {
  private models: Map<string, AIModel> = new Map()
  private quotaResetInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeModels()
    this.startQuotaResetTimer()
  }

  private initializeModels() {
    // Gemini Flash Models Only
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (geminiApiKey) {
      // Gemini 2.5 Flash (Primary - Latest and most efficient)
      this.models.set('gemini-2.5-flash', {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        apiKey: geminiApiKey,
        maxTokens: 8192,
        costPerToken: 0.000075, // $0.075 per 1K tokens
        quotaLimit: 2000, // Higher free tier limit for 2.5
        quotaUsed: 0,
        quotaResetTime: this.getNextMidnight(),
        priority: 1,
        isAvailable: true,
        circuitBreaker: new CircuitBreaker(5, 60000, 120000)
      })

      // Gemini 1.5 Flash (Secondary - Reliable fallback)
      this.models.set('gemini-1.5-flash', {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        apiKey: geminiApiKey,
        maxTokens: 8192,
        costPerToken: 0.000075, // $0.075 per 1K tokens
        quotaLimit: 1500, // Standard free tier limit
        quotaUsed: 0,
        quotaResetTime: this.getNextMidnight(),
        priority: 2,
        isAvailable: true,
        circuitBreaker: new CircuitBreaker(5, 60000, 120000)
      })

      // Gemini 1.5 Flash-8B (Tertiary - Fastest and cheapest)
      this.models.set('gemini-1.5-flash-8b', {
        id: 'gemini-1.5-flash-8b',
        name: 'Gemini 1.5 Flash 8B',
        provider: 'gemini',
        model: 'gemini-1.5-flash-8b',
        apiKey: geminiApiKey,
        maxTokens: 8192,
        costPerToken: 0.0000375, // $0.0375 per 1K tokens (cheapest)
        quotaLimit: 4000, // Very high free tier limit
        quotaUsed: 0,
        quotaResetTime: this.getNextMidnight(),
        priority: 3,
        isAvailable: true,
        circuitBreaker: new CircuitBreaker(5, 60000, 120000)
      })
    }

    // Local fallback model (always available)
    this.models.set('local-fallback', {
      id: 'local-fallback',
      name: 'Local Fallback',
      provider: 'local',
      model: 'local-responses',
      maxTokens: 1000,
      costPerToken: 0,
      quotaLimit: Infinity,
      quotaUsed: 0,
      quotaResetTime: Infinity,
      priority: 99, // Lowest priority
      isAvailable: true,
      circuitBreaker: new CircuitBreaker(10, 30000, 60000)
    })

    // Validate fallback model exists
    if (!this.models.has('local-fallback')) {
      throw new Error('Critical error: Local fallback model not initialized')
    }
  }

  private getNextMidnight(): number {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.getTime()
  }

  private startQuotaResetTimer() {
    // Reset quotas every hour (check for daily resets)
    this.quotaResetInterval = setInterval(() => {
      const now = Date.now()
      for (const model of this.models.values()) {
        if (now >= model.quotaResetTime) {
          model.quotaUsed = 0
          model.quotaResetTime = this.getNextMidnight()
          model.isAvailable = true
          ErrorLogger.logInfo(`Quota reset for model: ${model.name}`, { modelId: model.id })
        }
      }
    }, 60 * 60 * 1000) // Check every hour
  }

  private getAvailableModel(): AIModel | null {
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.isAvailable && 
        model.quotaUsed < model.quotaLimit &&
        model.circuitBreaker.getState().state !== 'OPEN'
      )
      .sort((a, b) => a.priority - b.priority)

    return availableModels[0] || null
  }

  private async callGeminiModel(model: AIModel, prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(model.apiKey!)
    const geminiModel = genAI.getGenerativeModel({ model: model.model })

    const result = await geminiModel.generateContent(prompt)
    const response = result.response
    return response.text()
  }



  private getLocalFallbackResponse(prompt: string, context?: string): string {
    const responses = {
      home: {
        en: "I'm a full-stack developer specializing in web applications, AI solutions, and mobile development. I can help you with project planning, technology recommendations, and development services. What would you like to know about my work or services?",
        fr: "Je suis un développeur full-stack spécialisé dans les applications web, les solutions IA et le développement mobile. Je peux vous aider avec la planification de projets, les recommandations technologiques et les services de développement. Que souhaitez-vous savoir sur mon travail ou mes services?"
      },
      services: {
        en: "I offer comprehensive development services including web applications, mobile apps, AI integration, and consulting. My expertise covers modern technologies like React, Next.js, Node.js, and cloud platforms. Would you like to discuss your specific project needs?",
        fr: "J'offre des services de développement complets incluant les applications web, les applications mobiles, l'intégration IA et le conseil. Mon expertise couvre les technologies modernes comme React, Next.js, Node.js et les plateformes cloud. Souhaitez-vous discuter de vos besoins spécifiques de projet?"
      },
      projects: {
        en: "My portfolio includes various web applications, mobile apps, and AI-powered solutions. I've worked with technologies like React, Next.js, TypeScript, and modern databases. Each project showcases different aspects of modern development practices. Which type of project interests you most?",
        fr: "Mon portfolio comprend diverses applications web, applications mobiles et solutions alimentées par l'IA. J'ai travaillé avec des technologies comme React, Next.js, TypeScript et des bases de données modernes. Chaque projet présente différents aspects des pratiques de développement modernes. Quel type de projet vous intéresse le plus?"
      },
      contact: {
        en: "I'm available for consultations and project discussions. You can reach out to discuss your requirements, get project estimates, or schedule a meeting. I typically respond within 24 hours and offer free initial consultations. How can I help you today?",
        fr: "Je suis disponible pour des consultations et des discussions de projets. Vous pouvez me contacter pour discuter de vos exigences, obtenir des estimations de projet ou planifier une réunion. Je réponds généralement dans les 24 heures et offre des consultations initiales gratuites. Comment puis-je vous aider aujourd'hui?"
      },
      default: {
        en: "I'm here to help with questions about web development, mobile applications, AI solutions, and technology consulting. Feel free to ask about specific technologies, project examples, or how I can assist with your development needs.",
        fr: "Je suis là pour vous aider avec des questions sur le développement web, les applications mobiles, les solutions IA et le conseil technologique. N'hésitez pas à poser des questions sur des technologies spécifiques, des exemples de projets ou comment je peux vous aider avec vos besoins de développement."
      }
    }

    // Simple language detection
    const isFrench = /\b(bonjour|salut|comment|pourquoi|où|quand|français|merci)\b/i.test(prompt)
    const locale = isFrench ? 'fr' : 'en'
    
    // Context-based response
    const contextResponses = responses[context as keyof typeof responses] || responses.default
    return contextResponses[locale]
  }

  public async generateResponse(
    prompt: string, 
    context?: string,
    preferredModel?: string
  ): Promise<AIResponse> {
    const startTime = Date.now()
    let attempts = 0
    const maxAttempts = this.models.size

    while (attempts < maxAttempts) {
      attempts++
      
      // Get the best available model
      let targetModel: AIModel | null = null
      
      if (preferredModel && this.models.has(preferredModel)) {
        const preferred = this.models.get(preferredModel)!
        if (preferred.isAvailable && preferred.quotaUsed < preferred.quotaLimit) {
          targetModel = preferred
        }
      }
      
      if (!targetModel) {
        targetModel = this.getAvailableModel()
      }

      if (!targetModel) {
        // All models exhausted, use local fallback
        const fallback = this.models.get('local-fallback')
        if (!fallback) {
          throw new Error('Critical error: Local fallback model not available')
        }

        const content = this.getLocalFallbackResponse(prompt, context)

        return {
          content,
          model: fallback.name,
          tokensUsed: Math.ceil(content.length / 4), // Rough token estimate
          cost: 0,
          responseTime: Date.now() - startTime
        }
      }

      try {
        let content: string
        
        // Call the appropriate model
        if (targetModel.provider === 'gemini') {
          content = await targetModel.circuitBreaker.execute(() =>
            this.callGeminiModel(targetModel!, prompt)
          )
        } else {
          // Local fallback
          content = this.getLocalFallbackResponse(prompt, context)
        }

        // Update usage statistics
        const tokensUsed = Math.ceil(content.length / 4) // Rough estimate
        targetModel.quotaUsed += tokensUsed
        
        const response: AIResponse = {
          content,
          model: targetModel.name,
          tokensUsed,
          cost: tokensUsed * targetModel.costPerToken,
          responseTime: Date.now() - startTime
        }

        // Log successful usage
        ErrorLogger.logInfo(`AI Model used: ${targetModel.name}`, {
          tokensUsed,
          quotaRemaining: targetModel.quotaLimit - targetModel.quotaUsed,
          responseTime: response.responseTime
        })

        return response

      } catch (error) {
        ErrorLogger.log(error as Error, {
          model: targetModel?.name || 'unknown',
          attempt: attempts,
          prompt: prompt.substring(0, 100)
        })

        // Handle quota errors
        if (error instanceof Error && error.message.includes('quota') && targetModel) {
          targetModel.isAvailable = false
          targetModel.lastError = 'Quota exceeded'
          ErrorLogger.logWarning(`Model ${targetModel.name} quota exceeded, switching to fallback`, {
            modelId: targetModel.id,
            quotaUsed: targetModel.quotaUsed,
            quotaLimit: targetModel.quotaLimit,
            errorType: 'quota_exceeded'
          })
          continue
        }

        // Handle other errors
        if (attempts >= maxAttempts) {
          if (targetModel) {
            throw new AIResponseError(targetModel.name, `Failed after ${maxAttempts} attempts: ${(error as Error).message}`)
          }
          throw error
        }

        // Mark model as temporarily unavailable and try next
        if (targetModel) {
          targetModel.isAvailable = false
          targetModel.lastError = (error as Error).message
        }
        continue
      }
    }

    // Final fallback
    const fallback = this.models.get('local-fallback')
    if (!fallback) {
      throw new Error('Critical error: Local fallback model not available')
    }

    const content = this.getLocalFallbackResponse(prompt, context)

    return {
      content,
      model: fallback.name,
      tokensUsed: Math.ceil(content.length / 4),
      cost: 0,
      responseTime: Date.now() - startTime
    }
  }

  public getModelStatus(): Array<{
    id: string
    name: string
    provider: string
    isAvailable: boolean
    quotaUsed: number
    quotaLimit: number
    quotaPercentage: number
    lastError?: string
    circuitBreakerState: string
  }> {
    return Array.from(this.models.values()).map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      isAvailable: model.isAvailable,
      quotaUsed: model.quotaUsed,
      quotaLimit: model.quotaLimit,
      quotaPercentage: (model.quotaUsed / model.quotaLimit) * 100,
      lastError: model.lastError,
      circuitBreakerState: model.circuitBreaker.getState().state
    }))
  }

  public resetModel(modelId: string): boolean {
    const model = this.models.get(modelId)
    if (model) {
      model.isAvailable = true
      model.lastError = undefined
      model.quotaUsed = 0
      return true
    }
    return false
  }

  public destroy() {
    if (this.quotaResetInterval) {
      clearInterval(this.quotaResetInterval)
    }
  }
}

// Singleton instance
export const aiModelManager = new AIModelManager()

export default aiModelManager
