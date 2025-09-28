// Content Moderation System
// Implements AI-powered inappropriate content detection, bias screening, and brand safety validation

import { ErrorLogger } from './error-handler'

export interface ModerationConfig {
  enableInappropriateContentDetection: boolean
  enableBiasScreening: boolean
  enableBrandSafetyValidation: boolean
  enableToxicityDetection: boolean
  enableSpamDetection: boolean
  enableProfanityFilter: boolean
  strictnessLevel: 'low' | 'medium' | 'high' | 'strict'
  customBlockedTerms: string[]
  customAllowedTerms: string[]
  enableAutoModeration: boolean
  enableHumanReview: boolean
  humanReviewThreshold: number
}

export interface ModerationResult {
  isApproved: boolean
  confidence: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  violations: ModerationViolation[]
  suggestions: string[]
  requiresHumanReview: boolean
  moderationReason: string
  metadata: {
    analyzedAt: number
    contentLength: number
    language: string
    moderationTime: number
  }
}

export interface ModerationViolation {
  type: 'inappropriate' | 'bias' | 'toxicity' | 'spam' | 'profanity' | 'brand_safety'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  message: string
  suggestion: string
  position?: { start: number; end: number }
  matchedText?: string
  category?: string
}

export interface ToxicityMetrics {
  overall: number
  threats: number
  insults: number
  obscene: number
  identityHate: number
  severeToxicity: number
}

export interface BiasMetrics {
  gender: number
  race: number
  religion: number
  age: number
  disability: number
  sexualOrientation: number
  political: number
  socioeconomic: number
}

export interface SpamMetrics {
  spamScore: number
  promotionalContent: number
  repetitiveContent: number
  suspiciousLinks: number
  excessiveKeywords: number
}

export interface BrandSafetyMetrics {
  violence: number
  adultContent: number
  drugs: number
  weapons: number
  hateSpeech: number
  terrorism: number
  selfHarm: number
}

class ContentModerator {
  private config: ModerationConfig
  private blockedTerms: Set<string> = new Set()
  private allowedTerms: Set<string> = new Set()
  private profanityPatterns: RegExp[] = []
  private biasPatterns: Map<string, RegExp[]> = new Map()
  private spamPatterns: RegExp[] = []
  private brandSafetyPatterns: Map<string, RegExp[]> = new Map()

  constructor(config: Partial<ModerationConfig> = {}) {
    this.config = {
      enableInappropriateContentDetection: true,
      enableBiasScreening: true,
      enableBrandSafetyValidation: true,
      enableToxicityDetection: true,
      enableSpamDetection: true,
      enableProfanityFilter: true,
      strictnessLevel: 'medium',
      customBlockedTerms: [],
      customAllowedTerms: [],
      enableAutoModeration: true,
      enableHumanReview: true,
      humanReviewThreshold: 0.7,
      ...config
    }

    this.initializeModerationPatterns()
    this.initializeBlockedTerms()
    this.initializeAllowedTerms()
  }

  /**
   * Moderate content
   */
  public async moderateContent(
    content: string,
    contentType: string = 'text',
    context?: string
  ): Promise<ModerationResult> {
    const startTime = Date.now()
    
    try {
      ErrorLogger.logInfo('Starting content moderation', {
        contentLength: content.length,
        contentType,
        context,
        strictnessLevel: this.config.strictnessLevel
      })

      const violations: ModerationViolation[] = []
      const suggestions: string[] = []

      // Profanity filter
      if (this.config.enableProfanityFilter) {
        const profanityViolations = this.checkProfanity(content)
        violations.push(...profanityViolations)
      }

      // Inappropriate content detection
      if (this.config.enableInappropriateContentDetection) {
        const inappropriateViolations = this.checkInappropriateContent(content)
        violations.push(...inappropriateViolations)
      }

      // Bias screening
      if (this.config.enableBiasScreening) {
        const biasViolations = this.checkBias(content)
        violations.push(...biasViolations)
      }

      // Toxicity detection
      if (this.config.enableToxicityDetection) {
        const toxicityViolations = this.checkToxicity(content)
        violations.push(...toxicityViolations)
      }

      // Spam detection
      if (this.config.enableSpamDetection) {
        const spamViolations = this.checkSpam(content)
        violations.push(...spamViolations)
      }

      // Brand safety validation
      if (this.config.enableBrandSafetyValidation) {
        const brandSafetyViolations = this.checkBrandSafety(content)
        violations.push(...brandSafetyViolations)
      }

      // Calculate risk level and confidence
      const riskLevel = this.calculateRiskLevel(violations)
      const confidence = this.calculateConfidence(violations)

      // Determine if human review is required
      const requiresHumanReview = this.requiresHumanReview(violations, confidence)

      // Generate suggestions
      suggestions.push(...this.generateModerationSuggestions(violations))

      // Determine approval
      const isApproved = this.determineApproval(violations, riskLevel, confidence)
      const moderationReason = this.getModerationReason(violations, isApproved, riskLevel)

      const result: ModerationResult = {
        isApproved,
        confidence,
        riskLevel,
        violations,
        suggestions,
        requiresHumanReview,
        moderationReason,
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          language: this.detectLanguage(content),
          moderationTime: Date.now() - startTime
        }
      }

      ErrorLogger.logInfo('Content moderation completed', {
        isApproved,
        riskLevel,
        confidence,
        violationsCount: violations.length,
        requiresHumanReview,
        moderationTime: result.metadata.moderationTime
      })

      return result

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'content-moderation' })
      
      // Return safe default result
      return {
        isApproved: false,
        confidence: 0,
        riskLevel: 'high',
        violations: [{
          type: 'inappropriate',
          severity: 'critical',
          confidence: 1.0,
          message: 'Content moderation system error',
          suggestion: 'Content could not be properly moderated. Please review manually.'
        }],
        suggestions: ['Content moderation system encountered an error. Manual review required.'],
        requiresHumanReview: true,
        moderationReason: 'Moderation system error',
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          language: 'unknown',
          moderationTime: Date.now() - startTime
        }
      }
    }
  }

  /**
   * Check for profanity
   */
  private checkProfanity(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    for (const pattern of this.profanityPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'profanity',
          severity: this.getSeverityForProfanity(matches[0]),
          confidence: 0.9,
          message: `Profanity detected: "${matches[0]}"`,
          suggestion: 'Remove or replace inappropriate language with professional alternatives.',
          matchedText: matches[0]
        })
      }
    }

    return violations
  }

  /**
   * Check for inappropriate content
   */
  private checkInappropriateContent(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    // Check for blocked terms
    for (const term of this.blockedTerms) {
      if (lowerContent.includes(term.toLowerCase())) {
        violations.push({
          type: 'inappropriate',
          severity: 'high',
          confidence: 0.8,
          message: `Blocked term detected: "${term}"`,
          suggestion: 'Remove or replace the blocked term with appropriate alternatives.',
          matchedText: term
        })
      }
    }

    // Check for inappropriate patterns
    const inappropriatePatterns = [
      {
        pattern: /\b(kill|murder|death|suicide|harm)\b/gi,
        severity: 'high' as const,
        message: 'Violent content detected',
        suggestion: 'Remove or tone down violent language.'
      },
      {
        pattern: /\b(hate|despise|loathe)\b/gi,
        severity: 'medium' as const,
        message: 'Negative sentiment detected',
        suggestion: 'Consider using more neutral or positive language.'
      }
    ]

    for (const { pattern, severity, message, suggestion } of inappropriatePatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'inappropriate',
          severity,
          confidence: 0.7,
          message,
          suggestion,
          matchedText: matches[0]
        })
      }
    }

    return violations
  }

  /**
   * Check for bias
   */
  private checkBias(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    // Check gender bias
    const genderBiasPatterns = this.biasPatterns.get('gender') || []
    for (const pattern of genderBiasPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'bias',
          severity: 'medium',
          confidence: 0.6,
          message: 'Potential gender bias detected',
          suggestion: 'Use gender-neutral language and ensure equal representation.',
          matchedText: matches[0],
          category: 'gender'
        })
      }
    }

    // Check racial bias
    const racialBiasPatterns = this.biasPatterns.get('race') || []
    for (const pattern of racialBiasPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'bias',
          severity: 'high',
          confidence: 0.8,
          message: 'Potential racial bias detected',
          suggestion: 'Remove or replace biased language with inclusive alternatives.',
          matchedText: matches[0],
          category: 'race'
        })
      }
    }

    // Check age bias
    const ageBiasPatterns = this.biasPatterns.get('age') || []
    for (const pattern of ageBiasPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'bias',
          severity: 'low',
          confidence: 0.5,
          message: 'Potential age bias detected',
          suggestion: 'Use age-inclusive language and avoid age-based assumptions.',
          matchedText: matches[0],
          category: 'age'
        })
      }
    }

    return violations
  }

  /**
   * Check for toxicity
   */
  private checkToxicity(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    // Check for threats
    const threatPatterns = [
      /\b(threaten|threat|harm|hurt|destroy|eliminate)\b/gi,
      /\b(kill|murder|assassinate|eliminate)\b/gi
    ]

    for (const pattern of threatPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'toxicity',
          severity: 'critical',
          confidence: 0.9,
          message: 'Threatening language detected',
          suggestion: 'Remove all threatening language immediately.',
          matchedText: matches[0]
        })
      }
    }

    // Check for insults
    const insultPatterns = [
      /\b(stupid|idiot|moron|dumb|foolish)\b/gi,
      /\b(worthless|useless|pathetic|disgusting)\b/gi
    ]

    for (const pattern of insultPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'toxicity',
          severity: 'medium',
          confidence: 0.7,
          message: 'Insulting language detected',
          suggestion: 'Replace insulting language with constructive feedback.',
          matchedText: matches[0]
        })
      }
    }

    return violations
  }

  /**
   * Check for spam
   */
  private checkSpam(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    // Check for excessive keywords
    const keywordCount = this.countKeywords(content)
    if (keywordCount > 10) {
      violations.push({
        type: 'spam',
        severity: 'medium',
        confidence: 0.6,
        message: 'Excessive keyword usage detected',
        suggestion: 'Reduce keyword density and focus on natural content flow.'
      })
    }

    // Check for promotional content
    const promotionalPatterns = [
      /\b(buy now|click here|limited time|act now|don't miss)\b/gi,
      /\b(free|discount|sale|offer|deal)\b/gi
    ]

    for (const pattern of promotionalPatterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 3) {
        violations.push({
          type: 'spam',
          severity: 'low',
          confidence: 0.5,
          message: 'Promotional content detected',
          suggestion: 'Reduce promotional language and focus on valuable content.'
        })
      }
    }

    // Check for suspicious links
    const suspiciousLinks = content.match(/https?:\/\/[^\s]+/gi) || []
    if (suspiciousLinks.length > 5) {
      violations.push({
        type: 'spam',
        severity: 'medium',
        confidence: 0.7,
        message: 'Excessive external links detected',
        suggestion: 'Reduce the number of external links and ensure they are relevant.'
      })
    }

    return violations
  }

  /**
   * Check brand safety
   */
  private checkBrandSafety(content: string): ModerationViolation[] {
    const violations: ModerationViolation[] = []
    const lowerContent = content.toLowerCase()

    // Check for violence
    const violencePatterns = this.brandSafetyPatterns.get('violence') || []
    for (const pattern of violencePatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'brand_safety',
          severity: 'high',
          confidence: 0.8,
          message: 'Violent content detected',
          suggestion: 'Remove or tone down violent language to maintain brand safety.',
          matchedText: matches[0]
        })
      }
    }

    // Check for adult content
    const adultContentPatterns = this.brandSafetyPatterns.get('adult') || []
    for (const pattern of adultContentPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'brand_safety',
          severity: 'high',
          confidence: 0.9,
          message: 'Adult content detected',
          suggestion: 'Remove adult content to maintain brand safety.',
          matchedText: matches[0]
        })
      }
    }

    // Check for drugs
    const drugPatterns = this.brandSafetyPatterns.get('drugs') || []
    for (const pattern of drugPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push({
          type: 'brand_safety',
          severity: 'high',
          confidence: 0.8,
          message: 'Drug-related content detected',
          suggestion: 'Remove or replace drug-related content.',
          matchedText: matches[0]
        })
      }
    }

    return violations
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(violations: ModerationViolation[]): 'low' | 'medium' | 'high' | 'critical' {
    if (violations.length === 0) return 'low'

    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    const highViolations = violations.filter(v => v.severity === 'high').length
    const mediumViolations = violations.filter(v => v.severity === 'medium').length

    if (criticalViolations > 0) return 'critical'
    if (highViolations > 2) return 'high'
    if (highViolations > 0 || mediumViolations > 3) return 'medium'
    return 'low'
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(violations: ModerationViolation[]): number {
    if (violations.length === 0) return 1.0

    const totalConfidence = violations.reduce((sum, violation) => sum + violation.confidence, 0)
    return totalConfidence / violations.length
  }

  /**
   * Determine if human review is required
   */
  private requiresHumanReview(violations: ModerationViolation[], confidence: number): boolean {
    if (!this.config.enableHumanReview) return false

    // Always require human review for critical violations
    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    if (criticalViolations > 0) return true

    // Require human review if confidence is below threshold
    if (confidence < this.config.humanReviewThreshold) return true

    // Require human review for high-risk content
    const riskLevel = this.calculateRiskLevel(violations)
    if (riskLevel === 'high' || riskLevel === 'critical') return true

    return false
  }

  /**
   * Determine approval
   */
  private determineApproval(
    violations: ModerationViolation[], 
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    confidence: number
  ): boolean {
    // Never approve critical violations
    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    if (criticalViolations > 0) return false

    // Check strictness level
    switch (this.config.strictnessLevel) {
      case 'strict':
        return violations.length === 0 && riskLevel === 'low'
      case 'high':
        return riskLevel === 'low' && violations.filter(v => v.severity === 'high').length === 0
      case 'medium':
        return riskLevel !== 'critical' && violations.filter(v => v.severity === 'high').length <= 1
      case 'low':
        return riskLevel !== 'critical'
      default:
        return riskLevel !== 'critical'
    }
  }

  /**
   * Get moderation reason
   */
  private getModerationReason(
    violations: ModerationViolation[], 
    isApproved: boolean, 
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    if (isApproved) {
      return `Content approved with ${riskLevel} risk level`
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical').length
    if (criticalViolations > 0) {
      return `Content rejected due to ${criticalViolations} critical violation(s)`
    }

    const highViolations = violations.filter(v => v.severity === 'high').length
    if (highViolations > 0) {
      return `Content rejected due to ${highViolations} high-severity violation(s)`
    }

    return `Content rejected due to ${riskLevel} risk level`
  }

  /**
   * Generate moderation suggestions
   */
  private generateModerationSuggestions(violations: ModerationViolation[]): string[] {
    const suggestions: string[] = []

    if (violations.length === 0) {
      suggestions.push('Content passed all moderation checks.')
      return suggestions
    }

    const violationTypes = new Set(violations.map(v => v.type))
    
    if (violationTypes.has('profanity')) {
      suggestions.push('Remove or replace profanity with professional language.')
    }
    
    if (violationTypes.has('bias')) {
      suggestions.push('Review content for bias and ensure inclusive language.')
    }
    
    if (violationTypes.has('toxicity')) {
      suggestions.push('Remove toxic language and maintain professional tone.')
    }
    
    if (violationTypes.has('spam')) {
      suggestions.push('Reduce promotional content and focus on valuable information.')
    }
    
    if (violationTypes.has('brand_safety')) {
      suggestions.push('Ensure content aligns with brand safety guidelines.')
    }

    return suggestions
  }

  /**
   * Get severity for profanity
   */
  private getSeverityForProfanity(profanity: string): 'low' | 'medium' | 'high' | 'critical' {
    const severeProfanity = ['fuck', 'shit', 'damn', 'hell']
    const moderateProfanity = ['crap', 'stupid', 'idiot']
    
    if (severeProfanity.some(word => profanity.toLowerCase().includes(word))) {
      return 'high'
    } else if (moderateProfanity.some(word => profanity.toLowerCase().includes(word))) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Count keywords in content
   */
  private countKeywords(content: string): number {
    const keywords = ['free', 'buy', 'sale', 'discount', 'offer', 'deal', 'limited', 'now']
    const lowerContent = content.toLowerCase()
    
    return keywords.reduce((count, keyword) => {
      const matches = lowerContent.match(new RegExp(`\\b${keyword}\\b`, 'g'))
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  /**
   * Detect language
   */
  private detectLanguage(content: string): string {
    const frenchPatterns = /\b(bonjour|salut|comment|pourquoi|où|quand|français|merci|oui|non|très|bien|mal|avec|sans|pour|dans|sur|sous|entre|parmi|depuis|jusqu'à|pendant|après|avant|maintenant|aujourd'hui|demain|hier|semaine|mois|année|heure|minute|seconde|jour|nuit|matin|soir|midi|minuit)\b/i
    return frenchPatterns.test(content) ? 'fr' : 'en'
  }

  /**
   * Initialize moderation patterns
   */
  private initializeModerationPatterns(): void {
    // Profanity patterns
    this.profanityPatterns = [
      /\b(fuck|fucking|fucked)\b/gi,
      /\b(shit|shitting|shitted)\b/gi,
      /\b(damn|damned|damning)\b/gi,
      /\b(hell|hellish)\b/gi,
      /\b(crap|crappy)\b/gi,
      /\b(stupid|stupidity)\b/gi,
      /\b(idiot|idiotic)\b/gi
    ]

    // Bias patterns
    this.biasPatterns.set('gender', [
      /\b(he|him|his)\b.*\b(programmer|developer|engineer)\b/gi,
      /\b(she|her|hers)\b.*\b(nurse|teacher|secretary)\b/gi,
      /\b(man|men)\b.*\b(strong|tough|aggressive)\b/gi,
      /\b(woman|women)\b.*\b(emotional|sensitive|nurturing)\b/gi
    ])

    this.biasPatterns.set('race', [
      /\b(black|white|asian|hispanic)\b.*\b(always|never|typically|usually)\b/gi,
      /\b(race|racial)\b.*\b(superior|inferior|better|worse)\b/gi
    ])

    this.biasPatterns.set('age', [
      /\b(old|young)\b.*\b(people|person)\b.*\b(can't|cannot|unable)\b/gi,
      /\b(millennial|boomer|gen z)\b.*\b(always|never|typically)\b/gi
    ])

    // Brand safety patterns
    this.brandSafetyPatterns.set('violence', [
      /\b(kill|murder|assassinate|eliminate|destroy)\b/gi,
      /\b(violence|violent|aggression|aggressive)\b/gi,
      /\b(weapon|gun|knife|bomb|explosive)\b/gi
    ])

    this.brandSafetyPatterns.set('adult', [
      /\b(sex|sexual|porn|pornography|nude|naked)\b/gi,
      /\b(adult|mature|explicit|graphic)\b/gi
    ])

    this.brandSafetyPatterns.set('drugs', [
      /\b(drug|drugs|marijuana|cocaine|heroin|meth)\b/gi,
      /\b(alcohol|drunk|drinking|beer|wine|whiskey)\b/gi
    ])
  }

  /**
   * Initialize blocked terms
   */
  private initializeBlockedTerms(): void {
    const defaultBlockedTerms = [
      'hate', 'discrimination', 'racism', 'sexism', 'homophobia',
      'violence', 'terrorism', 'extremism', 'radicalization'
    ]
    
    this.config.customBlockedTerms.forEach(term => {
      this.blockedTerms.add(term.toLowerCase())
    })
    
    defaultBlockedTerms.forEach(term => {
      this.blockedTerms.add(term.toLowerCase())
    })
  }

  /**
   * Initialize allowed terms
   */
  private initializeAllowedTerms(): void {
    this.config.customAllowedTerms.forEach(term => {
      this.allowedTerms.add(term.toLowerCase())
    })
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.initializeBlockedTerms()
    this.initializeAllowedTerms()
  }

  /**
   * Get current configuration
   */
  public getConfig(): ModerationConfig {
    return { ...this.config }
  }

  /**
   * Get moderation statistics
   */
  public getModerationStats(): {
    totalModerations: number
    approvalRate: number
    averageConfidence: number
    commonViolations: Array<{ type: string; count: number }>
    riskLevelDistribution: Record<string, number>
  } {
    // This would typically come from a database or storage system
    return {
      totalModerations: 0,
      approvalRate: 0,
      averageConfidence: 0,
      commonViolations: [],
      riskLevelDistribution: {}
    }
  }
}

// Singleton instance
export const contentModerator = new ContentModerator()

// Export types and class
export { ContentModerator }
export type { 
  ModerationConfig, 
  ModerationResult, 
  ModerationViolation,
  ToxicityMetrics,
  BiasMetrics,
  SpamMetrics,
  BrandSafetyMetrics
}
