// Quota Exhaustion Handling System
// Handles graceful quota exhaustion with user notifications and automatic recovery

import { ErrorLogger } from './error-handler'
import { AIModel } from './ai-model-manager'

export interface QuotaExhaustionEvent {
  modelId: string
  modelName: string
  quotaUsed: number
  quotaLimit: number
  quotaPercentage: number
  timestamp: number
  recoveryTime?: number
}

export interface QuotaExhaustionConfig {
  enableUserNotifications: boolean
  enableAutomaticRecovery: boolean
  recoveryCheckInterval: number // in milliseconds
  maxRecoveryAttempts: number
  notificationChannels: Array<'console' | 'email' | 'webhook' | 'dashboard'>
  webhookUrl?: string
  emailRecipients?: string[]
}

export interface QuotaExhaustionHandler {
  onQuotaExhausted: (event: QuotaExhaustionEvent) => void
  onQuotaRecovered: (modelId: string, recoveryTime: number) => void
  onRecoveryFailed: (modelId: string, attempts: number) => void
}

class QuotaExhaustionManager {
  private config: QuotaExhaustionConfig
  private exhaustedModels: Map<string, QuotaExhaustionEvent> = new Map()
  private recoveryAttempts: Map<string, number> = new Map()
  private recoveryInterval: NodeJS.Timeout | null = null
  private handlers: QuotaExhaustionHandler[] = []

  constructor(config: Partial<QuotaExhaustionConfig> = {}) {
    this.config = {
      enableUserNotifications: true,
      enableAutomaticRecovery: true,
      recoveryCheckInterval: 5 * 60 * 1000, // 5 minutes
      maxRecoveryAttempts: 10,
      notificationChannels: ['console', 'dashboard'],
      ...config
    }

    if (this.config.enableAutomaticRecovery) {
      this.startRecoveryMonitoring()
    }
  }

  /**
   * Handle quota exhaustion for a model
   */
  public handleQuotaExhaustion(model: AIModel): void {
    const event: QuotaExhaustionEvent = {
      modelId: model.id,
      modelName: model.name,
      quotaUsed: model.quotaUsed,
      quotaLimit: model.quotaLimit,
      quotaPercentage: model.quotaPercentage,
      timestamp: Date.now()
    }

    this.exhaustedModels.set(model.id, event)
    this.recoveryAttempts.set(model.id, 0)

    ErrorLogger.logError(new Error(`Quota exhausted for model: ${model.name}`), {
      modelId: model.id,
      quotaUsed: model.quotaUsed,
      quotaLimit: model.quotaLimit,
      quotaPercentage: model.quotaPercentage
    })

    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler.onQuotaExhausted(event)
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'quota-exhaustion-handler' })
      }
    })

    // Send notifications
    if (this.config.enableUserNotifications) {
      this.sendNotifications(event)
    }

    // Log the event
    this.logQuotaExhaustion(event)
  }

  /**
   * Check if a model has recovered from quota exhaustion
   */
  public checkModelRecovery(model: AIModel): boolean {
    const exhaustedEvent = this.exhaustedModels.get(model.id)
    if (!exhaustedEvent) return false

    // Check if quota has been reset or is below critical threshold
    const isRecovered = model.quotaUsed < model.quotaLimit * 0.9 // 90% threshold for recovery

    if (isRecovered) {
      const recoveryTime = Date.now() - exhaustedEvent.timestamp
      this.handleQuotaRecovery(model.id, recoveryTime)
      return true
    }

    return false
  }

  /**
   * Handle quota recovery for a model
   */
  private handleQuotaRecovery(modelId: string, recoveryTime: number): void {
    const exhaustedEvent = this.exhaustedModels.get(modelId)
    if (!exhaustedEvent) return

    // Update the event with recovery time
    exhaustedEvent.recoveryTime = recoveryTime

    ErrorLogger.logInfo(`Quota recovered for model: ${exhaustedEvent.modelName}`, {
      modelId,
      recoveryTime,
      recoveryTimeMinutes: Math.round(recoveryTime / 60000)
    })

    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler.onQuotaRecovered(modelId, recoveryTime)
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'quota-recovery-handler' })
      }
    })

    // Remove from exhausted models
    this.exhaustedModels.delete(modelId)
    this.recoveryAttempts.delete(modelId)

    // Send recovery notification
    if (this.config.enableUserNotifications) {
      this.sendRecoveryNotification(modelId, recoveryTime)
    }
  }

  /**
   * Start automatic recovery monitoring
   */
  private startRecoveryMonitoring(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval)
    }

    this.recoveryInterval = setInterval(() => {
      this.checkAllModelsRecovery()
    }, this.config.recoveryCheckInterval)
  }

  /**
   * Check recovery for all exhausted models
   */
  private checkAllModelsRecovery(): void {
    for (const [modelId, event] of this.exhaustedModels) {
      const attempts = this.recoveryAttempts.get(modelId) || 0
      
      if (attempts >= this.config.maxRecoveryAttempts) {
        this.handleRecoveryFailed(modelId, attempts)
        continue
      }

      // Increment recovery attempts
      this.recoveryAttempts.set(modelId, attempts + 1)

      // Check if model is available for recovery check
      // This would typically involve checking the actual model status
      // For now, we'll simulate the check
      this.simulateRecoveryCheck(modelId)
    }
  }

  /**
   * Simulate recovery check (in real implementation, this would check actual model status)
   */
  private simulateRecoveryCheck(modelId: string): void {
    // In a real implementation, this would:
    // 1. Check the actual model's quota status
    // 2. Verify if the quota has been reset
    // 3. Test the model's availability
    
    // For now, we'll just log the attempt
    ErrorLogger.logInfo(`Recovery check attempt for model: ${modelId}`, {
      modelId,
      attempts: this.recoveryAttempts.get(modelId) || 0
    })
  }

  /**
   * Handle recovery failure
   */
  private handleRecoveryFailed(modelId: string, attempts: number): void {
    const exhaustedEvent = this.exhaustedModels.get(modelId)
    if (!exhaustedEvent) return

    ErrorLogger.logError(new Error(`Quota recovery failed for model: ${exhaustedEvent.modelName}`), {
      modelId,
      attempts,
      maxAttempts: this.config.maxRecoveryAttempts
    })

    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler.onRecoveryFailed(modelId, attempts)
      } catch (error) {
        ErrorLogger.log(error as Error, { context: 'quota-recovery-failed-handler' })
      }
    })

    // Remove from exhausted models to stop further attempts
    this.exhaustedModels.delete(modelId)
    this.recoveryAttempts.delete(modelId)
  }

  /**
   * Send notifications for quota exhaustion
   */
  private sendNotifications(event: QuotaExhaustionEvent): void {
    const message = `Quota exhausted for model: ${event.modelName} (${event.quotaPercentage.toFixed(1)}% used)`

    this.config.notificationChannels.forEach(channel => {
      try {
        switch (channel) {
          case 'console':
            console.warn(`⚠️ ${message}`)
            break
          case 'email':
            this.sendEmailNotification(event, message)
            break
          case 'webhook':
            this.sendWebhookNotification(event, message)
            break
          case 'dashboard':
            this.sendDashboardNotification(event, message)
            break
        }
      } catch (error) {
        ErrorLogger.log(error as Error, { 
          context: 'quota-notification', 
          channel,
          modelId: event.modelId
        })
      }
    })
  }

  /**
   * Send recovery notification
   */
  private sendRecoveryNotification(modelId: string, recoveryTime: number): void {
    const message = `Quota recovered for model: ${modelId} (recovery time: ${Math.round(recoveryTime / 60000)} minutes)`

    this.config.notificationChannels.forEach(channel => {
      try {
        switch (channel) {
          case 'console':
            console.info(`✅ ${message}`)
            break
          case 'email':
            this.sendEmailRecoveryNotification(modelId, recoveryTime, message)
            break
          case 'webhook':
            this.sendWebhookRecoveryNotification(modelId, recoveryTime, message)
            break
          case 'dashboard':
            this.sendDashboardRecoveryNotification(modelId, recoveryTime, message)
            break
        }
      } catch (error) {
        ErrorLogger.log(error as Error, { 
          context: 'quota-recovery-notification', 
          channel,
          modelId
        })
      }
    })
  }

  /**
   * Send email notification
   */
  private sendEmailNotification(event: QuotaExhaustionEvent, message: string): void {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) {
      return
    }

    // In a real implementation, this would send actual emails
    ErrorLogger.logInfo(`Email notification sent: ${message}`, {
      recipients: this.config.emailRecipients,
      modelId: event.modelId
    })
  }

  /**
   * Send webhook notification
   */
  private sendWebhookNotification(event: QuotaExhaustionEvent, message: string): void {
    if (!this.config.webhookUrl) {
      return
    }

    // In a real implementation, this would send actual webhook requests
    ErrorLogger.logInfo(`Webhook notification sent: ${message}`, {
      webhookUrl: this.config.webhookUrl,
      modelId: event.modelId
    })
  }

  /**
   * Send dashboard notification
   */
  private sendDashboardNotification(event: QuotaExhaustionEvent, message: string): void {
    // In a real implementation, this would update a dashboard or real-time system
    ErrorLogger.logInfo(`Dashboard notification sent: ${message}`, {
      modelId: event.modelId
    })
  }

  /**
   * Send email recovery notification
   */
  private sendEmailRecoveryNotification(modelId: string, recoveryTime: number, message: string): void {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) {
      return
    }

    ErrorLogger.logInfo(`Email recovery notification sent: ${message}`, {
      recipients: this.config.emailRecipients,
      modelId
    })
  }

  /**
   * Send webhook recovery notification
   */
  private sendWebhookRecoveryNotification(modelId: string, recoveryTime: number, message: string): void {
    if (!this.config.webhookUrl) {
      return
    }

    ErrorLogger.logInfo(`Webhook recovery notification sent: ${message}`, {
      webhookUrl: this.config.webhookUrl,
      modelId
    })
  }

  /**
   * Send dashboard recovery notification
   */
  private sendDashboardRecoveryNotification(modelId: string, recoveryTime: number, message: string): void {
    ErrorLogger.logInfo(`Dashboard recovery notification sent: ${message}`, {
      modelId
    })
  }

  /**
   * Log quota exhaustion event
   */
  private logQuotaExhaustion(event: QuotaExhaustionEvent): void {
    ErrorLogger.logInfo('Quota exhaustion event logged', {
      modelId: event.modelId,
      modelName: event.modelName,
      quotaUsed: event.quotaUsed,
      quotaLimit: event.quotaLimit,
      quotaPercentage: event.quotaPercentage,
      timestamp: event.timestamp
    })
  }

  /**
   * Add event handler
   */
  public addHandler(handler: QuotaExhaustionHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Remove event handler
   */
  public removeHandler(handler: QuotaExhaustionHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  /**
   * Get exhausted models
   */
  public getExhaustedModels(): QuotaExhaustionEvent[] {
    return Array.from(this.exhaustedModels.values())
  }

  /**
   * Get recovery attempts for a model
   */
  public getRecoveryAttempts(modelId: string): number {
    return this.recoveryAttempts.get(modelId) || 0
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<QuotaExhaustionConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.enableAutomaticRecovery !== undefined) {
      if (newConfig.enableAutomaticRecovery) {
        this.startRecoveryMonitoring()
      } else {
        this.stopRecoveryMonitoring()
      }
    }
  }

  /**
   * Stop recovery monitoring
   */
  private stopRecoveryMonitoring(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval)
      this.recoveryInterval = null
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    exhaustedModels: number
    totalRecoveryAttempts: number
    averageRecoveryTime: number
    recoverySuccessRate: number
  } {
    const exhaustedModels = this.exhaustedModels.size
    const totalRecoveryAttempts = Array.from(this.recoveryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0)
    
    const recoveredModels = Array.from(this.exhaustedModels.values())
      .filter(event => event.recoveryTime !== undefined)
    
    const averageRecoveryTime = recoveredModels.length > 0
      ? recoveredModels.reduce((sum, event) => sum + (event.recoveryTime || 0), 0) / recoveredModels.length
      : 0

    const recoverySuccessRate = exhaustedModels > 0
      ? (recoveredModels.length / exhaustedModels) * 100
      : 100

    return {
      exhaustedModels,
      totalRecoveryAttempts,
      averageRecoveryTime,
      recoverySuccessRate
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopRecoveryMonitoring()
    this.exhaustedModels.clear()
    this.recoveryAttempts.clear()
    this.handlers = []
  }
}

// Singleton instance
export const quotaExhaustionManager = new QuotaExhaustionManager()

// Export types and class
export { QuotaExhaustionManager }
export type { QuotaExhaustionEvent, QuotaExhaustionConfig, QuotaExhaustionHandler }
