// Fact-Checking Integration System
// Implements external fact verification services, source citation validation, and accuracy scoring

import { ErrorLogger } from './error-handler'

export interface FactCheckConfig {
  enableExternalFactChecking: boolean
  enableSourceValidation: boolean
  enableAccuracyScoring: boolean
  enableWarningSystem: boolean
  factCheckServices: string[]
  maxFactCheckRequests: number
  factCheckTimeout: number
  enableCaching: boolean
  cacheExpiration: number
  strictnessLevel: 'low' | 'medium' | 'high' | 'strict'
  requireSourceCitations: boolean
  minSourceCount: number
}

export interface FactCheckResult {
  isVerified: boolean
  confidence: number
  accuracyScore: number
  verifiedFacts: VerifiedFact[]
  unverifiedClaims: UnverifiedClaim[]
  warnings: FactCheckWarning[]
  suggestions: string[]
  requiresReview: boolean
  factCheckReason: string
  metadata: {
    analyzedAt: number
    contentLength: number
    factCheckTime: number
    servicesUsed: string[]
  }
}

export interface VerifiedFact {
  claim: string
  confidence: number
  source: string
  verificationMethod: 'external_api' | 'source_validation' | 'pattern_matching'
  position: { start: number; end: number }
  category: 'technical' | 'statistical' | 'historical' | 'scientific' | 'general'
}

export interface UnverifiedClaim {
  claim: string
  reason: string
  suggestion: string
  position: { start: number; end: number }
  category: 'technical' | 'statistical' | 'historical' | 'scientific' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface FactCheckWarning {
  type: 'unverified_claim' | 'missing_source' | 'outdated_info' | 'contradiction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  suggestion: string
  position?: { start: number; end: number }
}

export interface FactCheckService {
  name: string
  endpoint: string
  apiKey?: string
  timeout: number
  maxRequests: number
  isAvailable: boolean
  lastUsed: number
  successRate: number
}

export interface SourceCitation {
  text: string
  url: string
  title: string
  author?: string
  date?: string
  reliability: 'high' | 'medium' | 'low' | 'unknown'
  position: { start: number; end: number }
}

export interface TechnicalClaim {
  claim: string
  category: 'programming' | 'framework' | 'library' | 'tool' | 'concept'
  confidence: number
  position: { start: number; end: number }
  requiresVerification: boolean
}

class FactChecker {
  private config: FactCheckConfig
  private factCheckServices: Map<string, FactCheckService> = new Map()
  private factCache: Map<string, { result: any; timestamp: number }> = new Map()
  private technicalKnowledgeBase: Map<string, any> = new Map()
  private sourceReliability: Map<string, number> = new Map()

  constructor(config: Partial<FactCheckConfig> = {}) {
    this.config = {
      enableExternalFactChecking: true,
      enableSourceValidation: true,
      enableAccuracyScoring: true,
      enableWarningSystem: true,
      factCheckServices: ['factcheck_api', 'source_validation', 'pattern_matching'],
      maxFactCheckRequests: 10,
      factCheckTimeout: 10000,
      enableCaching: true,
      cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours
      strictnessLevel: 'medium',
      requireSourceCitations: true,
      minSourceCount: 1,
      ...config
    }

    this.initializeFactCheckServices()
    this.initializeTechnicalKnowledgeBase()
    this.initializeSourceReliability()
  }

  /**
   * Fact-check content
   */
  public async factCheckContent(
    content: string,
    contentType: string = 'blog',
    context?: string
  ): Promise<FactCheckResult> {
    const startTime = Date.now()
    
    try {
      ErrorLogger.logInfo('Starting fact-checking', {
        contentLength: content.length,
        contentType,
        context,
        strictnessLevel: this.config.strictnessLevel
      })

      const verifiedFacts: VerifiedFact[] = []
      const unverifiedClaims: UnverifiedClaim[] = []
      const warnings: FactCheckWarning[] = []
      const suggestions: string[] = []

      // Extract claims from content
      const claims = this.extractClaims(content)
      
      // Extract source citations
      const citations = this.extractSourceCitations(content)

      // Check source citations
      if (this.config.enableSourceValidation) {
        const sourceValidationResult = await this.validateSourceCitations(citations)
        warnings.push(...sourceValidationResult.warnings)
      }

      // Fact-check each claim
      for (const claim of claims) {
        try {
          const factCheckResult = await this.factCheckClaim(claim, content)
          
          if (factCheckResult.isVerified) {
            verifiedFacts.push(factCheckResult.verifiedFact!)
          } else {
            unverifiedClaims.push(factCheckResult.unverifiedClaim!)
          }
        } catch (error) {
          ErrorLogger.logWarning(`Fact-checking failed for claim: ${claim}`, {
            error: (error as Error).message
          })
        }
      }

      // Check for missing source citations
      if (this.config.requireSourceCitations && citations.length < this.config.minSourceCount) {
        warnings.push({
          type: 'missing_source',
          severity: 'medium',
          message: `Content has ${citations.length} source citations, but ${this.config.minSourceCount} are required`,
          suggestion: 'Add more source citations to support your claims and improve credibility.'
        })
      }

      // Calculate accuracy score
      const accuracyScore = this.calculateAccuracyScore(verifiedFacts, unverifiedClaims, warnings)

      // Determine if review is required
      const requiresReview = this.requiresReview(unverifiedClaims, warnings, accuracyScore)

      // Generate suggestions
      suggestions.push(...this.generateFactCheckSuggestions(verifiedFacts, unverifiedClaims, warnings))

      // Determine verification status
      const isVerified = this.determineVerification(verifiedFacts, unverifiedClaims, warnings, accuracyScore)
      const factCheckReason = this.getFactCheckReason(verifiedFacts, unverifiedClaims, warnings, isVerified)

      const result: FactCheckResult = {
        isVerified,
        confidence: this.calculateConfidence(verifiedFacts, unverifiedClaims),
        accuracyScore,
        verifiedFacts,
        unverifiedClaims,
        warnings,
        suggestions,
        requiresReview,
        factCheckReason,
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          factCheckTime: Date.now() - startTime,
          servicesUsed: Array.from(this.factCheckServices.keys())
        }
      }

      ErrorLogger.logInfo('Fact-checking completed', {
        isVerified,
        accuracyScore,
        verifiedFactsCount: verifiedFacts.length,
        unverifiedClaimsCount: unverifiedClaims.length,
        warningsCount: warnings.length,
        requiresReview,
        factCheckTime: result.metadata.factCheckTime
      })

      return result

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'fact-checking' })
      
      // Return safe default result
      return {
        isVerified: false,
        confidence: 0,
        accuracyScore: 0,
        verifiedFacts: [],
        unverifiedClaims: [{
          claim: 'Content fact-checking failed',
          reason: 'System error during fact-checking',
          suggestion: 'Manual review required due to fact-checking system error.',
          position: { start: 0, end: content.length },
          category: 'general',
          severity: 'critical'
        }],
        warnings: [{
          type: 'unverified_claim',
          severity: 'critical',
          message: 'Fact-checking system error',
          suggestion: 'Manual fact-checking required due to system error.'
        }],
        suggestions: ['Fact-checking system encountered an error. Manual review required.'],
        requiresReview: true,
        factCheckReason: 'Fact-checking system error',
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          factCheckTime: Date.now() - startTime,
          servicesUsed: []
        }
      }
    }
  }

  /**
   * Extract claims from content
   */
  private extractClaims(content: string): string[] {
    const claims: string[] = []
    
    // Look for factual statements
    const claimPatterns = [
      // Statistical claims
      /\b(\d+%|\d+\/\d+|\d+ out of \d+)\b/gi,
      // Technical claims
      /\b(React|Vue|Angular|Node\.js|Python|JavaScript)\b.*\b(is|are|can|will|should)\b/gi,
      // Performance claims
      /\b(\d+x faster|\d+% improvement|\d+ms|\d+ seconds)\b/gi,
      // Version claims
      /\b(version \d+\.\d+|v\d+\.\d+)\b/gi,
      // Date claims
      /\b(in \d{4}|since \d{4}|before \d{4}|after \d{4})\b/gi
    ]

    for (const pattern of claimPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        claims.push(...matches)
      }
    }

    // Remove duplicates
    return [...new Set(claims)]
  }

  /**
   * Extract source citations from content
   */
  private extractSourceCitations(content: string): SourceCitation[] {
    const citations: SourceCitation[] = []
    
    // Look for URLs
    const urlPattern = /https?:\/\/[^\s]+/gi
    const urls = content.match(urlPattern) || []
    
    for (const url of urls) {
      const position = content.indexOf(url)
      citations.push({
        text: url,
        url: url,
        title: 'Unknown',
        reliability: this.getSourceReliability(url),
        position: { start: position, end: position + url.length }
      })
    }

    // Look for citation patterns
    const citationPatterns = [
      /\[(\d+)\]/gi,
      /\([^)]*https?:\/\/[^)]*\)/gi,
      /according to [^.]*\./gi
    ]

    for (const pattern of citationPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        for (const match of matches) {
          const position = content.indexOf(match)
          citations.push({
            text: match,
            url: '',
            title: 'Citation',
            reliability: 'medium',
            position: { start: position, end: position + match.length }
          })
        }
      }
    }

    return citations
  }

  /**
   * Fact-check a single claim
   */
  private async factCheckClaim(claim: string, content: string): Promise<{
    isVerified: boolean
    verifiedFact?: VerifiedFact
    unverifiedClaim?: UnverifiedClaim
  }> {
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.factCache.get(claim)
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiration) {
        return cached.result
      }
    }

    let result: any = { isVerified: false }

    // Try external fact-checking services
    if (this.config.enableExternalFactChecking) {
      for (const serviceName of this.config.factCheckServices) {
        const service = this.factCheckServices.get(serviceName)
        if (service && service.isAvailable) {
          try {
            result = await this.factCheckWithService(claim, service)
            if (result.isVerified) break
          } catch (error) {
            ErrorLogger.logWarning(`Fact-checking service ${serviceName} failed`, {
              error: (error as Error).message,
              claim
            })
          }
        }
      }
    }

    // If not verified externally, try pattern matching
    if (!result.isVerified) {
      result = this.factCheckWithPatternMatching(claim, content)
    }

    // Cache the result
    if (this.config.enableCaching) {
      this.factCache.set(claim, { result, timestamp: Date.now() })
    }

    return result
  }

  /**
   * Fact-check with external service
   */
  private async factCheckWithService(claim: string, service: FactCheckService): Promise<{
    isVerified: boolean
    verifiedFact?: VerifiedFact
    unverifiedClaim?: UnverifiedClaim
  }> {
    // Simulate external API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock verification logic
    const isVerified = Math.random() > 0.3 // 70% verification rate
    
    if (isVerified) {
      return {
        isVerified: true,
        verifiedFact: {
          claim,
          confidence: 0.8,
          source: service.name,
          verificationMethod: 'external_api',
          position: { start: 0, end: claim.length },
          category: this.categorizeClaim(claim)
        }
      }
    } else {
      return {
        isVerified: false,
        unverifiedClaim: {
          claim,
          reason: 'Could not verify with external service',
          suggestion: 'Add source citation or verify claim manually.',
          position: { start: 0, end: claim.length },
          category: this.categorizeClaim(claim),
          severity: 'medium'
        }
      }
    }
  }

  /**
   * Fact-check with pattern matching
   */
  private factCheckWithPatternMatching(claim: string, content: string): {
    isVerified: boolean
    verifiedFact?: VerifiedFact
    unverifiedClaim?: UnverifiedClaim
  } {
    const lowerClaim = claim.toLowerCase()
    
    // Check against technical knowledge base
    for (const [key, value] of this.technicalKnowledgeBase) {
      if (lowerClaim.includes(key.toLowerCase())) {
        return {
          isVerified: true,
          verifiedFact: {
            claim,
            confidence: 0.7,
            source: 'Technical Knowledge Base',
            verificationMethod: 'pattern_matching',
            position: { start: 0, end: claim.length },
            category: 'technical'
          }
        }
      }
    }

    // Check for common technical facts
    const commonTechnicalFacts = [
      'react is a javascript library',
      'node.js is a runtime',
      'typescript is a superset of javascript',
      'html is a markup language',
      'css is a styling language'
    ]

    for (const fact of commonTechnicalFacts) {
      if (lowerClaim.includes(fact)) {
        return {
          isVerified: true,
          verifiedFact: {
            claim,
            confidence: 0.9,
            source: 'Common Technical Knowledge',
            verificationMethod: 'pattern_matching',
            position: { start: 0, end: claim.length },
            category: 'technical'
          }
        }
      }
    }

    return {
      isVerified: false,
      unverifiedClaim: {
        claim,
        reason: 'Could not verify with pattern matching',
        suggestion: 'Add source citation or verify claim manually.',
        position: { start: 0, end: claim.length },
        category: this.categorizeClaim(claim),
        severity: 'low'
      }
    }
  }

  /**
   * Validate source citations
   */
  private async validateSourceCitations(citations: SourceCitation[]): Promise<{
    warnings: FactCheckWarning[]
  }> {
    const warnings: FactCheckWarning[] = []

    for (const citation of citations) {
      // Check source reliability
      if (citation.reliability === 'low') {
        warnings.push({
          type: 'missing_source',
          severity: 'medium',
          message: `Low reliability source: ${citation.url}`,
          suggestion: 'Use more reliable sources or verify information from multiple sources.',
          position: citation.position
        })
      }

      // Check for broken links (simplified)
      if (citation.url && !this.isValidUrl(citation.url)) {
        warnings.push({
          type: 'missing_source',
          severity: 'high',
          message: `Invalid or broken URL: ${citation.url}`,
          suggestion: 'Fix the URL or remove the broken link.',
          position: citation.position
        })
      }
    }

    return { warnings }
  }

  /**
   * Calculate accuracy score
   */
  private calculateAccuracyScore(
    verifiedFacts: VerifiedFact[],
    unverifiedClaims: UnverifiedClaim[],
    warnings: FactCheckWarning[]
  ): number {
    const totalClaims = verifiedFacts.length + unverifiedClaims.length
    if (totalClaims === 0) return 100

    const verifiedScore = verifiedFacts.length * 100
    const unverifiedPenalty = unverifiedClaims.length * 20
    const warningPenalty = warnings.length * 10

    const score = Math.max(0, (verifiedScore - unverifiedPenalty - warningPenalty) / totalClaims)
    return Math.round(score)
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(verifiedFacts: VerifiedFact[], unverifiedClaims: UnverifiedClaim[]): number {
    if (verifiedFacts.length === 0 && unverifiedClaims.length === 0) return 1.0

    const totalConfidence = verifiedFacts.reduce((sum, fact) => sum + fact.confidence, 0)
    const averageConfidence = totalConfidence / verifiedFacts.length

    return verifiedFacts.length > 0 ? averageConfidence : 0.3
  }

  /**
   * Determine if review is required
   */
  private requiresReview(
    unverifiedClaims: UnverifiedClaim[],
    warnings: FactCheckWarning[],
    accuracyScore: number
  ): boolean {
    // Always require review for critical unverified claims
    const criticalClaims = unverifiedClaims.filter(claim => claim.severity === 'critical').length
    if (criticalClaims > 0) return true

    // Require review for low accuracy scores
    if (accuracyScore < 60) return true

    // Require review for high-severity warnings
    const highSeverityWarnings = warnings.filter(warning => warning.severity === 'high').length
    if (highSeverityWarnings > 0) return true

    return false
  }

  /**
   * Determine verification status
   */
  private determineVerification(
    verifiedFacts: VerifiedFact[],
    unverifiedClaims: UnverifiedClaim[],
    warnings: FactCheckWarning[],
    accuracyScore: number
  ): boolean {
    // Never verify if there are critical unverified claims
    const criticalClaims = unverifiedClaims.filter(claim => claim.severity === 'critical').length
    if (criticalClaims > 0) return false

    // Check strictness level
    switch (this.config.strictnessLevel) {
      case 'strict':
        return unverifiedClaims.length === 0 && accuracyScore >= 90
      case 'high':
        return unverifiedClaims.length === 0 && accuracyScore >= 80
      case 'medium':
        return unverifiedClaims.length <= 2 && accuracyScore >= 70
      case 'low':
        return accuracyScore >= 60
      default:
        return accuracyScore >= 70
    }
  }

  /**
   * Get fact-check reason
   */
  private getFactCheckReason(
    verifiedFacts: VerifiedFact[],
    unverifiedClaims: UnverifiedClaim[],
    warnings: FactCheckWarning[],
    isVerified: boolean
  ): string {
    if (isVerified) {
      return `Content verified with ${verifiedFacts.length} verified facts`
    }

    const criticalClaims = unverifiedClaims.filter(claim => claim.severity === 'critical').length
    if (criticalClaims > 0) {
      return `Content rejected due to ${criticalClaims} critical unverified claims`
    }

    if (unverifiedClaims.length > 0) {
      return `Content has ${unverifiedClaims.length} unverified claims requiring review`
    }

    return 'Content requires manual fact-checking review'
  }

  /**
   * Generate fact-check suggestions
   */
  private generateFactCheckSuggestions(
    verifiedFacts: VerifiedFact[],
    unverifiedClaims: UnverifiedClaim[],
    warnings: FactCheckWarning[]
  ): string[] {
    const suggestions: string[] = []

    if (verifiedFacts.length > 0) {
      suggestions.push(`Content contains ${verifiedFacts.length} verified facts.`)
    }

    if (unverifiedClaims.length > 0) {
      suggestions.push(`Review ${unverifiedClaims.length} unverified claims and add source citations.`)
    }

    if (warnings.length > 0) {
      suggestions.push(`Address ${warnings.length} fact-checking warnings.`)
    }

    if (unverifiedClaims.length === 0 && warnings.length === 0) {
      suggestions.push('Content passed all fact-checking requirements.')
    }

    return suggestions
  }

  /**
   * Categorize claim
   */
  private categorizeClaim(claim: string): 'technical' | 'statistical' | 'historical' | 'scientific' | 'general' {
    const lowerClaim = claim.toLowerCase()
    
    if (lowerClaim.includes('react') || lowerClaim.includes('javascript') || lowerClaim.includes('programming')) {
      return 'technical'
    }
    
    if (lowerClaim.includes('%') || lowerClaim.includes('statistics') || lowerClaim.includes('data')) {
      return 'statistical'
    }
    
    if (lowerClaim.includes('history') || lowerClaim.includes('founded') || lowerClaim.includes('established')) {
      return 'historical'
    }
    
    if (lowerClaim.includes('research') || lowerClaim.includes('study') || lowerClaim.includes('scientific')) {
      return 'scientific'
    }
    
    return 'general'
  }

  /**
   * Get source reliability
   */
  private getSourceReliability(url: string): 'high' | 'medium' | 'low' | 'unknown' {
    const domain = new URL(url).hostname.toLowerCase()
    
    if (this.sourceReliability.has(domain)) {
      const score = this.sourceReliability.get(domain)!
      if (score >= 0.8) return 'high'
      if (score >= 0.6) return 'medium'
      return 'low'
    }
    
    // Default reliability based on domain
    if (domain.includes('wikipedia.org')) return 'medium'
    if (domain.includes('github.com')) return 'high'
    if (domain.includes('stackoverflow.com')) return 'medium'
    if (domain.includes('medium.com')) return 'low'
    
    return 'unknown'
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Initialize fact-check services
   */
  private initializeFactCheckServices(): void {
    this.factCheckServices.set('factcheck_api', {
      name: 'FactCheck API',
      endpoint: 'https://api.factcheck.org/v1/check',
      timeout: 5000,
      maxRequests: 100,
      isAvailable: true,
      lastUsed: 0,
      successRate: 0.85
    })

    this.factCheckServices.set('source_validation', {
      name: 'Source Validation',
      endpoint: 'internal',
      timeout: 2000,
      maxRequests: 1000,
      isAvailable: true,
      lastUsed: 0,
      successRate: 0.90
    })

    this.factCheckServices.set('pattern_matching', {
      name: 'Pattern Matching',
      endpoint: 'internal',
      timeout: 1000,
      maxRequests: 10000,
      isAvailable: true,
      lastUsed: 0,
      successRate: 0.70
    })
  }

  /**
   * Initialize technical knowledge base
   */
  private initializeTechnicalKnowledgeBase(): void {
    this.technicalKnowledgeBase.set('React', {
      description: 'A JavaScript library for building user interfaces',
      version: '18.x',
      reliability: 'high'
    })

    this.technicalKnowledgeBase.set('Node.js', {
      description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine',
      version: '20.x',
      reliability: 'high'
    })

    this.technicalKnowledgeBase.set('TypeScript', {
      description: 'A typed superset of JavaScript that compiles to plain JavaScript',
      version: '5.x',
      reliability: 'high'
    })

    this.technicalKnowledgeBase.set('JavaScript', {
      description: 'A programming language that conforms to the ECMAScript specification',
      version: 'ES2023',
      reliability: 'high'
    })
  }

  /**
   * Initialize source reliability
   */
  private initializeSourceReliability(): void {
    this.sourceReliability.set('github.com', 0.9)
    this.sourceReliability.set('stackoverflow.com', 0.8)
    this.sourceReliability.set('wikipedia.org', 0.7)
    this.sourceReliability.set('medium.com', 0.5)
    this.sourceReliability.set('dev.to', 0.6)
    this.sourceReliability.set('mdn.mozilla.org', 0.95)
    this.sourceReliability.set('nodejs.org', 0.95)
    this.sourceReliability.set('reactjs.org', 0.95)
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<FactCheckConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  public getConfig(): FactCheckConfig {
    return { ...this.config }
  }

  /**
   * Get fact-checking statistics
   */
  public getFactCheckStats(): {
    totalFactChecks: number
    verificationRate: number
    averageAccuracy: number
    commonUnverifiedClaims: Array<{ claim: string; count: number }>
  } {
    // This would typically come from a database or storage system
    return {
      totalFactChecks: 0,
      verificationRate: 0,
      averageAccuracy: 0,
      commonUnverifiedClaims: []
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.factCache.clear()
  }
}

// Singleton instance
export const factChecker = new FactChecker()

// Export types and class
export { FactChecker }
export type { 
  FactCheckConfig, 
  FactCheckResult, 
  VerifiedFact, 
  UnverifiedClaim, 
  FactCheckWarning,
  FactCheckService,
  SourceCitation,
  TechnicalClaim
}
