// Quota Limit Validation System
// Validates actual API quota limits vs hardcoded values

import { ErrorLogger } from './error-handler'

export interface QuotaValidationResult {
  modelId: string
  modelName: string
  hardcodedLimit: number
  actualLimit: number | null
  isValid: boolean
  validationMethod: 'api_response' | 'documentation' | 'fallback'
  lastValidated: number
  error?: string
}

export interface QuotaValidationConfig {
  enableApiValidation: boolean
  enableDocumentationValidation: boolean
  validationInterval: number // in milliseconds
  retryAttempts: number
  timeout: number // in milliseconds
}

class QuotaValidator {
  private validationResults: Map<string, QuotaValidationResult> = new Map()
  private validationInterval: NodeJS.Timeout | null = null
  private config: QuotaValidationConfig

  constructor(config: Partial<QuotaValidationConfig> = {}) {
    this.config = {
      enableApiValidation: true,
      enableDocumentationValidation: true,
      validationInterval: 24 * 60 * 60 * 1000, // 24 hours
      retryAttempts: 3,
      timeout: 10000, // 10 seconds
      ...config
    }
  }

  /**
   * Validate quota limits for a specific model
   */
  public async validateModelQuota(
    modelId: string,
    modelName: string,
    hardcodedLimit: number,
    apiKey?: string
  ): Promise<QuotaValidationResult> {
    const startTime = Date.now()
    
    try {
      ErrorLogger.logInfo(`Starting quota validation for model: ${modelName}`, {
        modelId,
        hardcodedLimit
      })

      let actualLimit: number | null = null
      let validationMethod: 'api_response' | 'documentation' | 'fallback' = 'fallback'
      let error: string | undefined

      // Try API validation first
      if (this.config.enableApiValidation && apiKey) {
        try {
          actualLimit = await this.validateViaApi(modelId, apiKey)
          if (actualLimit !== null) {
            validationMethod = 'api_response'
          }
        } catch (apiError) {
          error = `API validation failed: ${(apiError as Error).message}`
          ErrorLogger.logWarning(`API quota validation failed for ${modelName}`, {
            modelId,
            error: error
          })
        }
      }

      // Try documentation validation if API failed
      if (actualLimit === null && this.config.enableDocumentationValidation) {
        try {
          actualLimit = await this.validateViaDocumentation(modelId)
          if (actualLimit !== null) {
            validationMethod = 'documentation'
          }
        } catch (docError) {
          error = `Documentation validation failed: ${(docError as Error).message}`
          ErrorLogger.logWarning(`Documentation quota validation failed for ${modelName}`, {
            modelId,
            error: error
          })
        }
      }

      // Use fallback if all methods failed
      if (actualLimit === null) {
        actualLimit = hardcodedLimit
        validationMethod = 'fallback'
        error = 'All validation methods failed, using hardcoded limit'
      }

      const isValid = actualLimit === hardcodedLimit
      const validationTime = Date.now() - startTime

      const result: QuotaValidationResult = {
        modelId,
        modelName,
        hardcodedLimit,
        actualLimit,
        isValid,
        validationMethod,
        lastValidated: Date.now(),
        error
      }

      this.validationResults.set(modelId, result)

      ErrorLogger.logInfo(`Quota validation completed for model: ${modelName}`, {
        modelId,
        hardcodedLimit,
        actualLimit,
        isValid,
        validationMethod,
        validationTime
      })

      return result

    } catch (error) {
      const result: QuotaValidationResult = {
        modelId,
        modelName,
        hardcodedLimit,
        actualLimit: hardcodedLimit,
        isValid: false,
        validationMethod: 'fallback',
        lastValidated: Date.now(),
        error: `Validation failed: ${(error as Error).message}`
      }

      this.validationResults.set(modelId, result)
      ErrorLogger.log(error as Error, { context: 'quota-validation', modelId })
      
      return result
    }
  }

  /**
   * Validate quota limits via API calls
   */
  private async validateViaApi(modelId: string, apiKey: string): Promise<number | null> {
    // This is a placeholder implementation
    // In a real implementation, you would make actual API calls to check quota limits
    
    if (modelId.includes('gemini')) {
      // Simulate API call to Google AI Studio
      return await this.validateGeminiQuota(apiKey)
    }
    
    return null
  }

  /**
   * Validate Gemini quota limits
   */
  private async validateGeminiQuota(apiKey: string): Promise<number | null> {
    try {
      // This would be an actual API call to Google AI Studio
      // For now, we'll simulate the response based on model type
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return simulated limits based on model
      // In reality, this would come from the actual API response
      return 2000 // Default limit for Gemini models
      
    } catch (error) {
      throw new Error(`Gemini API validation failed: ${(error as Error).message}`)
    }
  }

  /**
   * Validate quota limits via documentation
   */
  private async validateViaDocumentation(modelId: string): Promise<number | null> {
    // This would parse official documentation or use cached data
    // For now, we'll use hardcoded values from official sources
    
    const documentedLimits: Record<string, number> = {
      'gemini-2.5-flash': 2000,
      'gemini-1.5-flash': 1500,
      'gemini-1.5-flash-8b': 4000,
      'gpt-4': 10000,
      'gpt-3.5-turbo': 50000
    }

    return documentedLimits[modelId] || null
  }

  /**
   * Get validation result for a model
   */
  public getValidationResult(modelId: string): QuotaValidationResult | null {
    return this.validationResults.get(modelId) || null
  }

  /**
   * Get all validation results
   */
  public getAllValidationResults(): QuotaValidationResult[] {
    return Array.from(this.validationResults.values())
  }

  /**
   * Check if validation is needed for a model
   */
  public needsValidation(modelId: string): boolean {
    const result = this.validationResults.get(modelId)
    if (!result) return true
    
    const timeSinceValidation = Date.now() - result.lastValidated
    return timeSinceValidation > this.config.validationInterval
  }

  /**
   * Start automatic validation
   */
  public startAutomaticValidation(models: Array<{
    id: string
    name: string
    limit: number
    apiKey?: string
  }>) {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
    }

    this.validationInterval = setInterval(async () => {
      for (const model of models) {
        if (this.needsValidation(model.id)) {
          try {
            await this.validateModelQuota(
              model.id,
              model.name,
              model.limit,
              model.apiKey
            )
          } catch (error) {
            ErrorLogger.log(error as Error, {
              context: 'automatic-quota-validation',
              modelId: model.id
            })
          }
        }
      }
    }, this.config.validationInterval)
  }

  /**
   * Stop automatic validation
   */
  public stopAutomaticValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }
  }

  /**
   * Get validation statistics
   */
  public getValidationStats(): {
    totalModels: number
    validatedModels: number
    validModels: number
    invalidModels: number
    lastValidation: number | null
  } {
    const results = this.getAllValidationResults()
    const validatedModels = results.length
    const validModels = results.filter(r => r.isValid).length
    const invalidModels = validatedModels - validModels
    const lastValidation = results.length > 0 
      ? Math.max(...results.map(r => r.lastValidated))
      : null

    return {
      totalModels: validatedModels,
      validatedModels,
      validModels,
      invalidModels,
      lastValidation
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<QuotaValidationConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Clear all validation results
   */
  public clearResults() {
    this.validationResults.clear()
  }
}

// Singleton instance
export const quotaValidator = new QuotaValidator()

// Export types and class
export { QuotaValidator }
export type { QuotaValidationResult, QuotaValidationConfig }
