// Multi-model AI manager with automatic fallback and quota management
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { ErrorLogger, CircuitBreaker, AIResponseError } from './error-handler'
import { quotaValidator } from './quota-validator'
import { quotaExhaustionManager } from './quota-exhaustion-handler'
import { contextAwareFallback } from './context-aware-fallback'
import { intelligentRetry } from './intelligent-retry'
import { EnhancedCircuitBreaker } from './enhanced-circuit-breaker'

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
  circuitBreaker: EnhancedCircuitBreaker
  // Enhanced quota tracking
  quotaPercentage: number
  quotaWarningThreshold: number
  quotaCriticalThreshold: number
  lastQuotaCheck: number
  quotaHistory: Array<{ timestamp: number; used: number; limit: number }>
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
  private quotaCheckInterval: NodeJS.Timeout | null = null
  private quotaWarningCallbacks: Array<(model: AIModel) => void> = []
  private quotaCriticalCallbacks: Array<(model: AIModel) => void> = []

  constructor() {
    this.initializeModels()
    this.startQuotaResetTimer()
    this.startQuotaCheckTimer()
    this.startQuotaValidation()
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
        circuitBreaker: new EnhancedCircuitBreaker({
          failureThreshold: 5,
          successThreshold: 3,
          timeout: 60000,
          monitoringPeriod: 120000,
          enableDynamicThresholds: true,
          healthCheckInterval: 30000,
          enableHealthChecks: true,
          adaptiveTimeout: true,
          minTimeout: 10000,
          maxTimeout: 300000,
          timeoutMultiplier: 1.5
        }),
        // Enhanced quota tracking
        quotaPercentage: 0,
        quotaWarningThreshold: 80, // 80% warning
        quotaCriticalThreshold: 95, // 95% critical
        lastQuotaCheck: Date.now(),
        quotaHistory: []
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
        circuitBreaker: new EnhancedCircuitBreaker({
          failureThreshold: 5,
          successThreshold: 3,
          timeout: 60000,
          monitoringPeriod: 120000,
          enableDynamicThresholds: true,
          healthCheckInterval: 30000,
          enableHealthChecks: true,
          adaptiveTimeout: true,
          minTimeout: 10000,
          maxTimeout: 300000,
          timeoutMultiplier: 1.5
        }),
        // Enhanced quota tracking
        quotaPercentage: 0,
        quotaWarningThreshold: 80,
        quotaCriticalThreshold: 95,
        lastQuotaCheck: Date.now(),
        quotaHistory: []
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
        circuitBreaker: new EnhancedCircuitBreaker({
          failureThreshold: 5,
          successThreshold: 3,
          timeout: 60000,
          monitoringPeriod: 120000,
          enableDynamicThresholds: true,
          healthCheckInterval: 30000,
          enableHealthChecks: true,
          adaptiveTimeout: true,
          minTimeout: 10000,
          maxTimeout: 300000,
          timeoutMultiplier: 1.5
        }),
        // Enhanced quota tracking
        quotaPercentage: 0,
        quotaWarningThreshold: 80,
        quotaCriticalThreshold: 95,
        lastQuotaCheck: Date.now(),
        quotaHistory: []
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
      circuitBreaker: new EnhancedCircuitBreaker({
        failureThreshold: 10,
        successThreshold: 3,
        timeout: 30000,
        monitoringPeriod: 60000,
        enableDynamicThresholds: true,
        healthCheckInterval: 30000,
        enableHealthChecks: true,
        adaptiveTimeout: true,
        minTimeout: 5000,
        maxTimeout: 120000,
        timeoutMultiplier: 1.2
      }),
      // Enhanced quota tracking
      quotaPercentage: 0,
      quotaWarningThreshold: 100,
      quotaCriticalThreshold: 100,
      lastQuotaCheck: Date.now(),
      quotaHistory: []
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
          model.quotaPercentage = 0
          ErrorLogger.logInfo(`Quota reset for model: ${model.name}`, { modelId: model.id })
        }
      }
    }, 60 * 60 * 1000) // Check every hour
  }

  private startQuotaCheckTimer() {
    // Check quota usage every 5 minutes
    this.quotaCheckInterval = setInterval(() => {
      this.checkQuotaUsage()
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  private checkQuotaUsage() {
    for (const model of this.models.values()) {
      if (model.provider === 'local') continue

      const previousPercentage = model.quotaPercentage
      model.quotaPercentage = (model.quotaUsed / model.quotaLimit) * 100
      model.lastQuotaCheck = Date.now()

      // Add to history (keep last 24 hours)
      model.quotaHistory.push({
        timestamp: Date.now(),
        used: model.quotaUsed,
        limit: model.quotaLimit
      })

      // Keep only last 288 entries (24 hours * 12 checks per hour)
      if (model.quotaHistory.length > 288) {
        model.quotaHistory = model.quotaHistory.slice(-288)
      }

      // Check for threshold crossings
      if (previousPercentage < model.quotaWarningThreshold && 
          model.quotaPercentage >= model.quotaWarningThreshold) {
        this.triggerQuotaWarning(model)
      }

      if (previousPercentage < model.quotaCriticalThreshold && 
          model.quotaPercentage >= model.quotaCriticalThreshold) {
        this.triggerQuotaCritical(model)
      }

      // Check for recovery
      quotaExhaustionManager.checkModelRecovery(model)
    }
  }

  private triggerQuotaWarning(model: AIModel) {
    ErrorLogger.logWarning(`Quota warning for model: ${model.name}`, {
      modelId: model.id,
      quotaPercentage: model.quotaPercentage,
      quotaUsed: model.quotaUsed,
      quotaLimit: model.quotaLimit
    })

    // Notify callbacks
    this.quotaWarningCallbacks.forEach(callback => {
      try {
        callback(model)
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'quota-warning-callback' })
      }
    })
  }

  private triggerQuotaCritical(model: AIModel) {
    ErrorLogger.log(new Error(`Quota critical for model: ${model.name}`), {
      modelId: model.id,
      quotaPercentage: model.quotaPercentage,
      quotaUsed: model.quotaUsed,
      quotaLimit: model.quotaLimit
    })

    // Handle quota exhaustion
    quotaExhaustionManager.handleQuotaExhaustion(model)

    // Notify callbacks
    this.quotaCriticalCallbacks.forEach(callback => {
      try {
        callback(model)
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'quota-critical-callback' })
      }
    })
  }

  public onQuotaWarning(callback: (model: AIModel) => void) {
    this.quotaWarningCallbacks.push(callback)
  }

  public onQuotaCritical(callback: (model: AIModel) => void) {
    this.quotaCriticalCallbacks.push(callback)
  }

  private startQuotaValidation() {
    // Start quota validation for all models
    const models = Array.from(this.models.values()).map(model => ({
      id: model.id,
      name: model.name,
      limit: model.quotaLimit,
      apiKey: model.apiKey
    }))

    quotaValidator.startAutomaticValidation(models)
  }

  private getAvailableModel(): AIModel | null {
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.isAvailable && 
        model.quotaUsed < model.quotaLimit &&
        model.circuitBreaker.getState().state !== 'OPEN' &&
        model.quotaPercentage < model.quotaCriticalThreshold
      )
      .sort((a, b) => a.priority - b.priority)

    return availableModels[0] || null
  }

  private async callGeminiModel(model: AIModel, prompt: string): Promise<string> {
    const result = await intelligentRetry.executeWithErrorDetection(async () => {
      const genAI = new GoogleGenerativeAI(model.apiKey!)
      const geminiModel = genAI.getGenerativeModel({ model: model.model })

      const result = await geminiModel.generateContent(prompt)
      const response = result.response
      return response.text()
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      jitterRange: 0.1
    })

    if (result.success) {
      return result.result!
    } else {
      throw result.error || new Error('Failed to call Gemini model')
    }
  }



  private getLocalFallbackResponse(prompt: string, context?: string): string {
    // Use context-aware fallback system
    const fallbackResponse = contextAwareFallback.generateFallbackResponse(prompt, {
      pageContext: context,
      locale: this.detectLanguage(prompt),
      timestamp: Date.now()
    })

    return fallbackResponse.content
  }

  private detectLanguage(text: string): 'en' | 'fr' {
    const frenchPatterns = /\b(bonjour|salut|comment|pourquoi|où|quand|français|merci|oui|non|très|bien|mal|avec|sans|pour|dans|sur|sous|entre|parmi|depuis|jusqu'à|pendant|après|avant|maintenant|aujourd'hui|demain|hier|semaine|mois|année|heure|minute|seconde|jour|nuit|matin|soir|midi|minuit)\b/i
    return frenchPatterns.test(text) ? 'fr' : 'en'
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
        if (preferred.isAvailable && 
            preferred.quotaUsed < preferred.quotaLimit &&
            preferred.quotaPercentage < preferred.quotaCriticalThreshold) {
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
        targetModel.quotaPercentage = (targetModel.quotaUsed / targetModel.quotaLimit) * 100
        
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
          targetModel.quotaPercentage = 100
          this.triggerQuotaCritical(targetModel)
          ErrorLogger.logWarning(`Model ${targetModel.name} quota exceeded, switching to fallback`, {
            modelId: targetModel.id,
            quotaUsed: targetModel.quotaUsed,
            quotaLimit: targetModel.quotaLimit,
            quotaPercentage: targetModel.quotaPercentage,
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
    quotaWarningThreshold: number
    quotaCriticalThreshold: number
    lastQuotaCheck: number
    quotaHistory: Array<{ timestamp: number; used: number; limit: number }>
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
      quotaPercentage: model.quotaPercentage,
      quotaWarningThreshold: model.quotaWarningThreshold,
      quotaCriticalThreshold: model.quotaCriticalThreshold,
      lastQuotaCheck: model.lastQuotaCheck,
      quotaHistory: model.quotaHistory,
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
      model.quotaPercentage = 0
      return true
    }
    return false
  }

  public destroy() {
    if (this.quotaResetInterval) {
      clearInterval(this.quotaResetInterval)
    }
    if (this.quotaCheckInterval) {
      clearInterval(this.quotaCheckInterval)
    }
    quotaValidator.stopAutomaticValidation()
    quotaExhaustionManager.destroy()
  }
}

// Singleton instance
export const aiModelManager = new AIModelManager()

export default aiModelManager
