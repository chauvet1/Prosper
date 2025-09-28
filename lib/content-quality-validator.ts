// Automated Content Quality Scoring System
// Implements multi-dimensional content assessment including grammar, readability, SEO, and technical accuracy

import { ErrorLogger } from './error-handler'

export interface ContentQualityConfig {
  enableGrammarCheck: boolean
  enableReadabilityCheck: boolean
  enableSEOCheck: boolean
  enableTechnicalAccuracyCheck: boolean
  enableBrandVoiceCheck: boolean
  minWordCount: number
  maxWordCount: number
  targetReadabilityScore: number
  minSEOScore: number
  brandVoiceKeywords: string[]
  technicalTerms: string[]
}

export interface QualityScore {
  overall: number
  grammar: number
  readability: number
  seo: number
  technicalAccuracy: number
  brandVoice: number
  wordCount: number
  readTime: number
}

export interface QualityIssue {
  type: 'grammar' | 'readability' | 'seo' | 'technical' | 'brand' | 'length'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  suggestion: string
  position?: { start: number; end: number }
}

export interface ContentQualityResult {
  score: QualityScore
  issues: QualityIssue[]
  suggestions: string[]
  isApproved: boolean
  approvalReason: string
  metadata: {
    analyzedAt: number
    contentLength: number
    language: string
    contentType: string
  }
}

export interface GrammarRule {
  pattern: RegExp
  message: string
  suggestion: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ReadabilityMetrics {
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  complexWords: number
  totalWords: number
  totalSentences: number
  totalSyllables: number
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
  smogIndex: number
}

export interface SEOMetrics {
  titleLength: number
  metaDescriptionLength: number
  headingStructure: number
  keywordDensity: number
  internalLinks: number
  externalLinks: number
  imageAltText: number
  readabilityScore: number
  contentLength: number
  keywordRelevance: number
}

class ContentQualityValidator {
  private config: ContentQualityConfig
  private grammarRules: GrammarRule[] = []
  private brandVoicePatterns: string[] = []
  private technicalTerms: Set<string> = new Set()

  constructor(config: Partial<ContentQualityConfig> = {}) {
    this.config = {
      enableGrammarCheck: true,
      enableReadabilityCheck: true,
      enableSEOCheck: true,
      enableTechnicalAccuracyCheck: true,
      enableBrandVoiceCheck: true,
      minWordCount: 300,
      maxWordCount: 3000,
      targetReadabilityScore: 60,
      minSEOScore: 70,
      brandVoiceKeywords: [
        'professional', 'expert', 'comprehensive', 'innovative', 'cutting-edge',
        'modern', 'efficient', 'scalable', 'robust', 'reliable', 'secure'
      ],
      technicalTerms: [
        'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
        'API', 'database', 'frontend', 'backend', 'full-stack', 'cloud',
        'deployment', 'CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Azure'
      ],
      ...config
    }

    this.initializeGrammarRules()
    this.initializeBrandVoicePatterns()
    this.initializeTechnicalTerms()
  }

  /**
   * Validate content quality
   */
  public async validateContent(
    content: string,
    title?: string,
    metaDescription?: string,
    contentType: string = 'blog'
  ): Promise<ContentQualityResult> {
    try {
      ErrorLogger.logInfo('Starting content quality validation', {
        contentLength: content.length,
        contentType,
        hasTitle: !!title,
        hasMetaDescription: !!metaDescription
      })

      const issues: QualityIssue[] = []
      const suggestions: string[] = []

      // Word count check
      const wordCount = this.countWords(content)
      if (wordCount < this.config.minWordCount) {
        issues.push({
          type: 'length',
          severity: 'medium',
          message: `Content is too short (${wordCount} words). Minimum required: ${this.config.minWordCount}`,
          suggestion: 'Add more detailed information, examples, or explanations to reach the minimum word count.'
        })
      } else if (wordCount > this.config.maxWordCount) {
        issues.push({
          type: 'length',
          severity: 'low',
          message: `Content is quite long (${wordCount} words). Consider breaking it into sections.`,
          suggestion: 'Consider splitting the content into multiple sections or creating a series of related posts.'
        })
      }

      // Grammar check
      if (this.config.enableGrammarCheck) {
        const grammarIssues = this.checkGrammar(content)
        issues.push(...grammarIssues)
      }

      // Readability check
      if (this.config.enableReadabilityCheck) {
        const readabilityIssues = this.checkReadability(content)
        issues.push(...readabilityIssues)
      }

      // SEO check
      if (this.config.enableSEOCheck) {
        const seoIssues = this.checkSEO(content, title, metaDescription)
        issues.push(...seoIssues)
      }

      // Technical accuracy check
      if (this.config.enableTechnicalAccuracyCheck) {
        const technicalIssues = this.checkTechnicalAccuracy(content)
        issues.push(...technicalIssues)
      }

      // Brand voice check
      if (this.config.enableBrandVoiceCheck) {
        const brandIssues = this.checkBrandVoice(content)
        issues.push(...brandIssues)
      }

      // Calculate scores
      const score = this.calculateQualityScore(content, issues, wordCount)

      // Generate suggestions
      suggestions.push(...this.generateSuggestions(issues, score))

      // Determine approval
      const isApproved = this.determineApproval(score, issues)
      const approvalReason = this.getApprovalReason(score, issues, isApproved)

      const result: ContentQualityResult = {
        score,
        issues,
        suggestions,
        isApproved,
        approvalReason,
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          language: this.detectLanguage(content),
          contentType
        }
      }

      ErrorLogger.logInfo('Content quality validation completed', {
        overallScore: score.overall,
        issuesCount: issues.length,
        isApproved,
        contentType
      })

      return result

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'content-quality-validation' })
      
      // Return basic validation result
      return {
        score: {
          overall: 0,
          grammar: 0,
          readability: 0,
          seo: 0,
          technicalAccuracy: 0,
          brandVoice: 0,
          wordCount: this.countWords(content),
          readTime: this.calculateReadTime(content)
        },
        issues: [{
          type: 'technical',
          severity: 'critical',
          message: 'Content validation failed due to system error',
          suggestion: 'Please try again or contact support if the issue persists.'
        }],
        suggestions: ['Content validation system encountered an error. Please try again.'],
        isApproved: false,
        approvalReason: 'Validation system error',
        metadata: {
          analyzedAt: Date.now(),
          contentLength: content.length,
          language: 'unknown',
          contentType
        }
      }
    }
  }

  /**
   * Check grammar and spelling
   */
  private checkGrammar(content: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    for (const rule of this.grammarRules) {
      const matches = content.match(rule.pattern)
      if (matches) {
        issues.push({
          type: 'grammar',
          severity: rule.severity,
          message: rule.message,
          suggestion: rule.suggestion,
          position: { start: 0, end: content.length } // Simplified position
        })
      }
    }

    return issues
  }

  /**
   * Check readability
   */
  private checkReadability(content: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const metrics = this.calculateReadabilityMetrics(content)

    // Check Flesch Reading Ease score
    if (metrics.fleschReadingEase < 30) {
      issues.push({
        type: 'readability',
        severity: 'high',
        message: `Content is very difficult to read (Flesch Reading Ease: ${metrics.fleschReadingEase.toFixed(1)})`,
        suggestion: 'Simplify sentence structure and use shorter, more common words.'
      })
    } else if (metrics.fleschReadingEase > 90) {
      issues.push({
        type: 'readability',
        severity: 'low',
        message: `Content is very easy to read (Flesch Reading Ease: ${metrics.fleschReadingEase.toFixed(1)})`,
        suggestion: 'Consider adding more technical depth for professional audiences.'
      })
    }

    // Check average words per sentence
    if (metrics.averageWordsPerSentence > 20) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: `Sentences are too long (average: ${metrics.averageWordsPerSentence.toFixed(1)} words)`,
        suggestion: 'Break long sentences into shorter, more digestible ones.'
      })
    }

    // Check complex words ratio
    const complexWordsRatio = (metrics.complexWords / metrics.totalWords) * 100
    if (complexWordsRatio > 15) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: `Too many complex words (${complexWordsRatio.toFixed(1)}%)`,
        suggestion: 'Replace complex words with simpler alternatives where possible.'
      })
    }

    return issues
  }

  /**
   * Check SEO optimization
   */
  private checkSEO(content: string, title?: string, metaDescription?: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const seoMetrics = this.calculateSEOMetrics(content, title, metaDescription)

    // Check title length
    if (title) {
      if (title.length < 30) {
        issues.push({
          type: 'seo',
          severity: 'medium',
          message: `Title is too short (${title.length} characters)`,
          suggestion: 'Aim for 30-60 characters for optimal SEO performance.'
        })
      } else if (title.length > 60) {
        issues.push({
          type: 'seo',
          severity: 'low',
          message: `Title is too long (${title.length} characters)`,
          suggestion: 'Consider shortening the title to under 60 characters.'
        })
      }
    }

    // Check meta description length
    if (metaDescription) {
      if (metaDescription.length < 120) {
        issues.push({
          type: 'seo',
          severity: 'medium',
          message: `Meta description is too short (${metaDescription.length} characters)`,
          suggestion: 'Aim for 120-160 characters for optimal SEO performance.'
        })
      } else if (metaDescription.length > 160) {
        issues.push({
          type: 'seo',
          severity: 'low',
          message: `Meta description is too long (${metaDescription.length} characters)`,
          suggestion: 'Consider shortening the meta description to under 160 characters.'
        })
      }
    }

    // Check heading structure
    if (seoMetrics.headingStructure < 3) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'Content lacks proper heading structure',
        suggestion: 'Add H1, H2, and H3 headings to improve content organization and SEO.'
      })
    }

    // Check keyword density
    if (seoMetrics.keywordDensity < 1) {
      issues.push({
        type: 'seo',
        severity: 'low',
        message: 'Low keyword density detected',
        suggestion: 'Consider adding more relevant keywords naturally throughout the content.'
      })
    } else if (seoMetrics.keywordDensity > 3) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'High keyword density detected',
        suggestion: 'Reduce keyword usage to avoid over-optimization penalties.'
      })
    }

    return issues
  }

  /**
   * Check technical accuracy
   */
  private checkTechnicalAccuracy(content: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const lowerContent = content.toLowerCase()

    // Check for outdated technical terms
    const outdatedTerms = [
      'jquery', 'angularjs', 'bootstrap 3', 'ie6', 'ie7', 'ie8',
      'flash', 'silverlight', 'asp.net web forms'
    ]

    for (const term of outdatedTerms) {
      if (lowerContent.includes(term)) {
        issues.push({
          type: 'technical',
          severity: 'medium',
          message: `Outdated technology mentioned: ${term}`,
          suggestion: 'Consider updating to modern alternatives or clearly mark as legacy technology.'
        })
      }
    }

    // Check for technical inconsistencies
    if (lowerContent.includes('javascript') && lowerContent.includes('java')) {
      issues.push({
        type: 'technical',
        severity: 'low',
        message: 'Potential confusion between JavaScript and Java',
        suggestion: 'Clarify the difference between JavaScript and Java if both are mentioned.'
      })
    }

    return issues
  }

  /**
   * Check brand voice consistency
   */
  private checkBrandVoice(content: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const lowerContent = content.toLowerCase()

    // Check for brand voice keywords
    let brandVoiceScore = 0
    for (const keyword of this.config.brandVoiceKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        brandVoiceScore++
      }
    }

    const brandVoiceRatio = (brandVoiceScore / this.config.brandVoiceKeywords.length) * 100

    if (brandVoiceRatio < 20) {
      issues.push({
        type: 'brand',
        severity: 'low',
        message: 'Content could better reflect brand voice',
        suggestion: 'Consider incorporating more professional and technical terminology that aligns with your brand.'
      })
    }

    // Check for unprofessional language
    const unprofessionalPatterns = [
      /\b(awesome|cool|amazing|incredible)\b/gi,
      /\b(like|you know|basically|literally)\b/gi,
      /\b(um|uh|er|ah)\b/gi
    ]

    for (const pattern of unprofessionalPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'brand',
          severity: 'low',
          message: 'Informal language detected',
          suggestion: 'Replace informal expressions with more professional alternatives.'
        })
      }
    }

    return issues
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(content: string, issues: QualityIssue[], wordCount: number): QualityScore {
    let grammarScore = 100
    let readabilityScore = 100
    let seoScore = 100
    let technicalScore = 100
    let brandScore = 100

    // Deduct points for issues
    for (const issue of issues) {
      const deduction = this.getSeverityDeduction(issue.severity)
      
      switch (issue.type) {
        case 'grammar':
          grammarScore -= deduction
          break
        case 'readability':
          readabilityScore -= deduction
          break
        case 'seo':
          seoScore -= deduction
          break
        case 'technical':
          technicalScore -= deduction
          break
        case 'brand':
          brandScore -= deduction
          break
      }
    }

    // Ensure scores don't go below 0
    grammarScore = Math.max(0, grammarScore)
    readabilityScore = Math.max(0, readabilityScore)
    seoScore = Math.max(0, seoScore)
    technicalScore = Math.max(0, technicalScore)
    brandScore = Math.max(0, brandScore)

    // Calculate overall score (weighted average)
    const overallScore = (
      grammarScore * 0.25 +
      readabilityScore * 0.25 +
      seoScore * 0.20 +
      technicalScore * 0.15 +
      brandScore * 0.15
    )

    return {
      overall: Math.round(overallScore),
      grammar: Math.round(grammarScore),
      readability: Math.round(readabilityScore),
      seo: Math.round(seoScore),
      technicalAccuracy: Math.round(technicalScore),
      brandVoice: Math.round(brandScore),
      wordCount,
      readTime: this.calculateReadTime(content)
    }
  }

  /**
   * Get severity deduction
   */
  private getSeverityDeduction(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'low': return 5
      case 'medium': return 15
      case 'high': return 30
      case 'critical': return 50
      default: return 10
    }
  }

  /**
   * Generate suggestions
   */
  private generateSuggestions(issues: QualityIssue[], score: QualityScore): string[] {
    const suggestions: string[] = []

    if (score.overall < 70) {
      suggestions.push('Content quality needs improvement. Focus on the highest priority issues first.')
    }

    if (score.grammar < 80) {
      suggestions.push('Review grammar and spelling. Consider using a grammar checker tool.')
    }

    if (score.readability < 60) {
      suggestions.push('Improve readability by using shorter sentences and simpler words.')
    }

    if (score.seo < 70) {
      suggestions.push('Optimize for SEO by improving title, meta description, and keyword usage.')
    }

    if (score.technicalAccuracy < 80) {
      suggestions.push('Verify technical accuracy and update any outdated information.')
    }

    if (score.brandVoice < 70) {
      suggestions.push('Align content with brand voice and professional tone.')
    }

    return suggestions
  }

  /**
   * Determine approval
   */
  private determineApproval(score: QualityScore, issues: QualityIssue[]): boolean {
    // Check for critical issues
    const criticalIssues = issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      return false
    }

    // Check overall score
    if (score.overall < 60) {
      return false
    }

    // Check individual scores
    if (score.grammar < 50 || score.readability < 40 || score.technicalAccuracy < 50) {
      return false
    }

    return true
  }

  /**
   * Get approval reason
   */
  private getApprovalReason(score: QualityScore, issues: QualityIssue[], isApproved: boolean): string {
    if (isApproved) {
      return `Content approved with overall score of ${score.overall}/100`
    }

    const criticalIssues = issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      return `Content rejected due to ${criticalIssues.length} critical issue(s)`
    }

    if (score.overall < 60) {
      return `Content rejected due to low overall score (${score.overall}/100)`
    }

    if (score.grammar < 50) {
      return 'Content rejected due to poor grammar score'
    }

    if (score.readability < 40) {
      return 'Content rejected due to poor readability score'
    }

    if (score.technicalAccuracy < 50) {
      return 'Content rejected due to poor technical accuracy score'
    }

    return 'Content rejected due to quality issues'
  }

  /**
   * Calculate readability metrics
   */
  private calculateReadabilityMetrics(content: string): ReadabilityMetrics {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0)
    const complexWords = words.filter(word => this.countSyllables(word) >= 3).length

    const averageWordsPerSentence = words.length / sentences.length
    const averageSyllablesPerWord = syllables / words.length

    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59

    // Gunning Fog Index
    const gunningFog = 0.4 * (averageWordsPerSentence + (complexWords / words.length) * 100)

    // SMOG Index
    const smogIndex = 1.043 * Math.sqrt(complexWords * (30 / sentences.length)) + 3.1291

    return {
      averageWordsPerSentence,
      averageSyllablesPerWord,
      complexWords,
      totalWords: words.length,
      totalSentences: sentences.length,
      totalSyllables: syllables,
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFog,
      smogIndex
    }
  }

  /**
   * Calculate SEO metrics
   */
  private calculateSEOMetrics(content: string, title?: string, metaDescription?: string): SEOMetrics {
    const headingMatches = content.match(/<h[1-6][^>]*>/gi) || []
    const internalLinks = (content.match(/href="[^"]*"/gi) || []).length
    const externalLinks = (content.match(/href="https?:\/\/[^"]*"/gi) || []).length
    const imageAltText = (content.match(/alt="[^"]*"/gi) || []).length

    return {
      titleLength: title?.length || 0,
      metaDescriptionLength: metaDescription?.length || 0,
      headingStructure: headingMatches.length,
      keywordDensity: 2.5, // Simplified calculation
      internalLinks,
      externalLinks,
      imageAltText,
      readabilityScore: 70, // Simplified calculation
      contentLength: content.length,
      keywordRelevance: 75 // Simplified calculation
    }
  }

  /**
   * Count syllables in a word
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = 'aeiouy'
    let syllableCount = 0
    let previousWasVowel = false
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        syllableCount++
      }
      previousWasVowel = isVowel
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--
    }
    
    return Math.max(1, syllableCount)
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Calculate read time
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = this.countWords(content)
    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * Detect language
   */
  private detectLanguage(content: string): string {
    const frenchPatterns = /\b(bonjour|salut|comment|pourquoi|où|quand|français|merci|oui|non|très|bien|mal|avec|sans|pour|dans|sur|sous|entre|parmi|depuis|jusqu'à|pendant|après|avant|maintenant|aujourd'hui|demain|hier|semaine|mois|année|heure|minute|seconde|jour|nuit|matin|soir|midi|minuit)\b/i
    return frenchPatterns.test(content) ? 'fr' : 'en'
  }

  /**
   * Initialize grammar rules
   */
  private initializeGrammarRules(): void {
    this.grammarRules = [
      {
        pattern: /\b(its|it's)\b/gi,
        message: 'Check usage of "its" vs "it\'s"',
        suggestion: 'Use "its" for possession, "it\'s" for "it is" or "it has"',
        severity: 'medium'
      },
      {
        pattern: /\b(there|their|they're)\b/gi,
        message: 'Check usage of "there", "their", or "they\'re"',
        suggestion: 'Use "there" for location, "their" for possession, "they\'re" for "they are"',
        severity: 'medium'
      },
      {
        pattern: /\b(your|you're)\b/gi,
        message: 'Check usage of "your" vs "you\'re"',
        suggestion: 'Use "your" for possession, "you\'re" for "you are"',
        severity: 'medium'
      },
      {
        pattern: /\b(loose|lose)\b/gi,
        message: 'Check usage of "loose" vs "lose"',
        suggestion: 'Use "loose" for not tight, "lose" for not win or misplace',
        severity: 'low'
      },
      {
        pattern: /\b(affect|effect)\b/gi,
        message: 'Check usage of "affect" vs "effect"',
        suggestion: 'Use "affect" as a verb, "effect" as a noun',
        severity: 'low'
      }
    ]
  }

  /**
   * Initialize brand voice patterns
   */
  private initializeBrandVoicePatterns(): void {
    this.brandVoicePatterns = [
      'professional', 'expert', 'comprehensive', 'innovative', 'cutting-edge',
      'modern', 'efficient', 'scalable', 'robust', 'reliable', 'secure'
    ]
  }

  /**
   * Initialize technical terms
   */
  private initializeTechnicalTerms(): void {
    this.config.technicalTerms.forEach(term => {
      this.technicalTerms.add(term.toLowerCase())
    })
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ContentQualityConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.initializeTechnicalTerms()
  }

  /**
   * Get current configuration
   */
  public getConfig(): ContentQualityConfig {
    return { ...this.config }
  }

  /**
   * Get validation statistics
   */
  public getValidationStats(): {
    totalValidations: number
    averageScore: number
    approvalRate: number
    commonIssues: Array<{ type: string; count: number }>
  } {
    // This would typically come from a database or storage system
    return {
      totalValidations: 0,
      averageScore: 0,
      approvalRate: 0,
      commonIssues: []
    }
  }
}

// Singleton instance
export const contentQualityValidator = new ContentQualityValidator()

// Export types and class
export { ContentQualityValidator }
export type { 
  ContentQualityConfig, 
  QualityScore, 
  QualityIssue, 
  ContentQualityResult,
  GrammarRule,
  ReadabilityMetrics,
  SEOMetrics
}
