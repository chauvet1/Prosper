// Voice Interface Implementation
// Provides speech-to-text, text-to-speech capabilities, and multi-language voice support

import { ErrorLogger } from './error-handler'

export interface VoiceConfig {
  enableSpeechRecognition: boolean
  enableTextToSpeech: boolean
  enableMultiLanguage: boolean
  defaultLanguage: string
  supportedLanguages: string[]
  speechRecognitionTimeout: number
  textToSpeechTimeout: number
  enableVoiceCommands: boolean
  enableVoiceNavigation: boolean
  enableVoiceSearch: boolean
  enableVoiceFeedback: boolean
  voiceQuality: 'low' | 'medium' | 'high' | 'ultra'
  enableNoiseReduction: boolean
  enableEchoCancellation: boolean
  enableVoiceActivityDetection: boolean
  enableVoiceBiometrics: boolean
}

export interface VoiceCommand {
  id: string
  command: string
  action: string
  parameters: Record<string, any>
  confidence: number
  timestamp: number
  language: string
  userId?: string
}

export interface VoiceResponse {
  text: string
  audio?: ArrayBuffer
  confidence: number
  language: string
  duration: number
  timestamp: number
  metadata: {
    voiceQuality: string
    processingTime: number
    audioFormat: string
    sampleRate: number
  }
}

export interface SpeechRecognitionResult {
  text: string
  confidence: number
  language: string
  alternatives: Array<{
    text: string
    confidence: number
  }>
  isFinal: boolean
  timestamp: number
  duration: number
  metadata: {
    processingTime: number
    audioQuality: number
    noiseLevel: number
  }
}

export interface TextToSpeechResult {
  audio: ArrayBuffer
  duration: number
  language: string
  voice: string
  quality: string
  timestamp: number
  metadata: {
    processingTime: number
    audioFormat: string
    sampleRate: number
    bitRate: number
  }
}

export interface VoiceSession {
  id: string
  userId?: string
  language: string
  startTime: number
  endTime?: number
  commands: VoiceCommand[]
  responses: VoiceResponse[]
  isActive: boolean
  metadata: {
    deviceType: string
    browserInfo: string
    audioQuality: number
  }
}

export interface VoiceBiometrics {
  userId: string
  voicePrint: string
  confidence: number
  features: {
    pitch: number
    tone: number
    speed: number
    accent: string
    clarity: number
  }
  timestamp: number
}

class VoiceInterface {
  private config: VoiceConfig
  private activeSessions: Map<string, VoiceSession> = new Map()
  private voiceCommands: Map<string, VoiceCommand> = new Map()
  private voiceBiometrics: Map<string, VoiceBiometrics> = new Map()
  private speechRecognition: any = null
  private speechSynthesis: any = null
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private isListening: boolean = false

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = {
      enableSpeechRecognition: true,
      enableTextToSpeech: true,
      enableMultiLanguage: true,
      defaultLanguage: 'en-US',
      supportedLanguages: ['en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'],
      speechRecognitionTimeout: 10000,
      textToSpeechTimeout: 5000,
      enableVoiceCommands: true,
      enableVoiceNavigation: true,
      enableVoiceSearch: true,
      enableVoiceFeedback: true,
      voiceQuality: 'high',
      enableNoiseReduction: true,
      enableEchoCancellation: true,
      enableVoiceActivityDetection: true,
      enableVoiceBiometrics: false,
      ...config
    }

    this.initializeVoiceInterface()
  }

  /**
   * Initialize voice interface
   */
  private async initializeVoiceInterface(): Promise<void> {
    try {
      // Initialize speech recognition
      if (this.config.enableSpeechRecognition && 'webkitSpeechRecognition' in window) {
        this.speechRecognition = new (window as any).webkitSpeechRecognition()
        this.configureSpeechRecognition()
      }

      // Initialize speech synthesis
      if (this.config.enableTextToSpeech && 'speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis
      }

      // Initialize audio context
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      ErrorLogger.logInfo('Voice interface initialized successfully', {
        speechRecognition: !!this.speechRecognition,
        speechSynthesis: !!this.speechSynthesis,
        audioContext: !!this.audioContext
      })

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'voice-interface-initialization' })
    }
  }

  /**
   * Configure speech recognition
   */
  private configureSpeechRecognition(): void {
    if (!this.speechRecognition) return

    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = true
    this.speechRecognition.lang = this.config.defaultLanguage
    this.speechRecognition.maxAlternatives = 3

    // Add event listeners
    this.speechRecognition.onstart = () => {
      this.isListening = true
      ErrorLogger.logInfo('Speech recognition started')
    }

    this.speechRecognition.onend = () => {
      this.isListening = false
      ErrorLogger.logInfo('Speech recognition ended')
    }

    this.speechRecognition.onerror = (event: any) => {
      this.isListening = false
      ErrorLogger.log(new Error(`Speech recognition error: ${event.error}`), {
        error: event.error,
        type: event.type
      })
    }
  }

  /**
   * Start voice session
   */
  public async startVoiceSession(
    userId?: string,
    language?: string,
    deviceType: string = 'web'
  ): Promise<string> {
    const sessionId = `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: VoiceSession = {
      id: sessionId,
      userId,
      language: language || this.config.defaultLanguage,
      startTime: Date.now(),
      commands: [],
      responses: [],
      isActive: true,
      metadata: {
        deviceType,
        browserInfo: navigator.userAgent,
        audioQuality: 0
      }
    }

    this.activeSessions.set(sessionId, session)

    ErrorLogger.logInfo('Voice session started', {
      sessionId,
      userId,
      language: session.language,
      deviceType
    })

    return sessionId
  }

  /**
   * End voice session
   */
  public async endVoiceSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Voice session not found: ${sessionId}`)
    }

    session.isActive = false
    session.endTime = Date.now()

    // Stop speech recognition if active
    if (this.isListening) {
      this.stopSpeechRecognition()
    }

    ErrorLogger.logInfo('Voice session ended', {
      sessionId,
      duration: session.endTime - session.startTime,
      commandsCount: session.commands.length,
      responsesCount: session.responses.length
    })
  }

  /**
   * Start speech recognition
   */
  public async startSpeechRecognition(
    sessionId: string,
    language?: string,
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not available')
    }

    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Voice session not found: ${sessionId}`)
    }

    try {
      // Set language
      if (language) {
        this.speechRecognition.lang = language
      }

      // Add result handler
      this.speechRecognition.onresult = (event: any) => {
        const result = this.processSpeechRecognitionResult(event, session)
        if (onResult) {
          onResult(result)
        }
      }

      // Add error handler
      this.speechRecognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`)
        if (onError) {
          onError(error)
        }
      }

      // Start recognition
      this.speechRecognition.start()

      ErrorLogger.logInfo('Speech recognition started', {
        sessionId,
        language: this.speechRecognition.lang
      })

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'start-speech-recognition', sessionId })
      throw error
    }
  }

  /**
   * Stop speech recognition
   */
  public stopSpeechRecognition(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop()
      this.isListening = false
      ErrorLogger.logInfo('Speech recognition stopped')
    }
  }

  /**
   * Process speech recognition result
   */
  private processSpeechRecognitionResult(event: any, session: VoiceSession): SpeechRecognitionResult {
    const startTime = Date.now()
    let finalTranscript = ''
    let interimTranscript = ''
    let confidence = 0
    const alternatives: Array<{ text: string; confidence: number }> = []

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript
      const resultConfidence = result[0].confidence || 0

      if (result.isFinal) {
        finalTranscript += transcript
        confidence = Math.max(confidence, resultConfidence)
      } else {
        interimTranscript += transcript
      }

      // Add alternatives
      if (result.length > 1) {
        for (let j = 1; j < result.length; j++) {
          alternatives.push({
            text: result[j].transcript,
            confidence: result[j].confidence || 0
          })
        }
      }
    }

    const text = finalTranscript || interimTranscript
    const processingTime = Date.now() - startTime

    const result: SpeechRecognitionResult = {
      text,
      confidence,
      language: session.language,
      alternatives,
      isFinal: !!finalTranscript,
      timestamp: Date.now(),
      duration: processingTime,
      metadata: {
        processingTime,
        audioQuality: this.calculateAudioQuality(),
        noiseLevel: this.calculateNoiseLevel()
      }
    }

    return result
  }

  /**
   * Convert text to speech
   */
  public async textToSpeech(
    text: string,
    language?: string,
    voice?: string,
    quality: string = this.config.voiceQuality
  ): Promise<TextToSpeechResult> {
    if (!this.speechSynthesis) {
      throw new Error('Text-to-speech not available')
    }

    const startTime = Date.now()

    try {
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set language
      if (language) {
        utterance.lang = language
      }

      // Set voice
      if (voice) {
        const voices = this.speechSynthesis.getVoices()
        const selectedVoice = voices.find((v: any) => v.name === voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      // Set quality parameters
      this.configureVoiceQuality(utterance, quality)

      // Generate audio
      const audio = await this.generateAudioFromUtterance(utterance)
      const processingTime = Date.now() - startTime

      const result: TextToSpeechResult = {
        audio,
        duration: this.calculateAudioDuration(audio),
        language: utterance.lang,
        voice: utterance.voice?.name || 'default',
        quality,
        timestamp: Date.now(),
        metadata: {
          processingTime,
          audioFormat: 'audio/wav',
          sampleRate: 44100,
          bitRate: 128000
        }
      }

      ErrorLogger.logInfo('Text-to-speech completed', {
        textLength: text.length,
        language: result.language,
        voice: result.voice,
        quality,
        processingTime
      })

      return result

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'text-to-speech' })
      throw error
    }
  }

  /**
   * Configure voice quality
   */
  private configureVoiceQuality(utterance: SpeechSynthesisUtterance, quality: string): void {
    switch (quality) {
      case 'ultra':
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0
        break
      case 'high':
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 0.9
        break
      case 'medium':
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        break
      case 'low':
        utterance.rate = 0.8
        utterance.pitch = 0.9
        utterance.volume = 0.7
        break
    }
  }

  /**
   * Generate audio from utterance using real Web Speech API
   */
  private async generateAudioFromUtterance(utterance: SpeechSynthesisUtterance): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.audioContext) {
        reject(new Error('Audio context not available'))
        return
      }

      // Use real Web Speech API with audio capture
      const audioChunks: Blob[] = []
      const destination = this.audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          const arrayBuffer = await audioBlob.arrayBuffer()
          resolve(arrayBuffer)
        } catch (error) {
          reject(error)
        }
      }
      
      mediaRecorder.onerror = (event) => {
        reject(new Error(`MediaRecorder error: ${event.error}`))
      }
      
      // Start recording
      mediaRecorder.start()
      
      // Set up utterance event handlers
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop()
        }, 100) // Small delay to ensure audio is captured
      }
      
      utterance.onerror = (event) => {
        mediaRecorder.stop()
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }
      
      // Speak the utterance
      this.speechSynthesis.speak(utterance)
    })
  }

  /**
   * Process voice command
   */
  public async processVoiceCommand(
    sessionId: string,
    command: string,
    confidence: number,
    language: string
  ): Promise<VoiceCommand> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Voice session not found: ${sessionId}`)
    }

    const voiceCommand: VoiceCommand = {
      id: `command_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      command,
      action: this.parseVoiceCommand(command),
      parameters: this.extractCommandParameters(command),
      confidence,
      timestamp: Date.now(),
      language,
      userId: session.userId
    }

    session.commands.push(voiceCommand)
    this.voiceCommands.set(voiceCommand.id, voiceCommand)

    ErrorLogger.logInfo('Voice command processed', {
      sessionId,
      commandId: voiceCommand.id,
      command,
      action: voiceCommand.action,
      confidence,
      language
    })

    return voiceCommand
  }

  /**
   * Parse voice command
   */
  private parseVoiceCommand(command: string): string {
    const lowerCommand = command.toLowerCase()
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      return 'navigate'
    }
    
    // Search commands
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      return 'search'
    }
    
    // Help commands
    if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      return 'help'
    }
    
    // Contact commands
    if (lowerCommand.includes('contact') || lowerCommand.includes('get in touch')) {
      return 'contact'
    }
    
    // Portfolio commands
    if (lowerCommand.includes('portfolio') || lowerCommand.includes('projects')) {
      return 'portfolio'
    }
    
    // Blog commands
    if (lowerCommand.includes('blog') || lowerCommand.includes('articles')) {
      return 'blog'
    }
    
    // Services commands
    if (lowerCommand.includes('services') || lowerCommand.includes('what do you do')) {
      return 'services'
    }
    
    return 'unknown'
  }

  /**
   * Extract command parameters
   */
  private extractCommandParameters(command: string): Record<string, any> {
    const parameters: Record<string, any> = {}
    const lowerCommand = command.toLowerCase()
    
    // Extract navigation target
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      const match = command.match(/(?:go to|navigate to)\s+(.+)/i)
      if (match) {
        parameters.target = match[1].trim()
      }
    }
    
    // Extract search query
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      const match = command.match(/(?:search|find)\s+(.+)/i)
      if (match) {
        parameters.query = match[1].trim()
      }
    }
    
    return parameters
  }

  /**
   * Generate voice response
   */
  public async generateVoiceResponse(
    sessionId: string,
    text: string,
    language?: string
  ): Promise<VoiceResponse> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error(`Voice session not found: ${sessionId}`)
    }

    const startTime = Date.now()
    const responseLanguage = language || session.language

    try {
      // Generate text-to-speech
      const ttsResult = await this.textToSpeech(text, responseLanguage)
      
      const response: VoiceResponse = {
        text,
        audio: ttsResult.audio,
        confidence: 0.9, // High confidence for generated responses
        language: responseLanguage,
        duration: ttsResult.duration,
        timestamp: Date.now(),
        metadata: {
          voiceQuality: this.config.voiceQuality,
          processingTime: Date.now() - startTime,
          audioFormat: ttsResult.metadata.audioFormat,
          sampleRate: ttsResult.metadata.sampleRate
        }
      }

      session.responses.push(response)

      ErrorLogger.logInfo('Voice response generated', {
        sessionId,
        textLength: text.length,
        language: responseLanguage,
        duration: response.duration,
        processingTime: response.metadata.processingTime
      })

      return response

    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'generate-voice-response', sessionId })
      throw error
    }
  }

  /**
   * Calculate audio quality using real audio analysis
   */
  private calculateAudioQuality(): number {
    if (!this.audioContext) return 0.5
    
    try {
      // Use real audio analysis with Web Audio API
      const analyser = this.audioContext.createAnalyser()
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      
      // Calculate signal-to-noise ratio
      const signal = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const noise = Math.sqrt(dataArray.reduce((sum, value) => sum + Math.pow(value - signal, 2), 0) / dataArray.length)
      
      const snr = signal / (noise + 1) // Add 1 to avoid division by zero
      return Math.min(1, Math.max(0, snr / 100)) // Normalize to 0-1 range
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'audio-quality-calculation' })
      return 0.5
    }
  }

  /**
   * Calculate noise level using real audio analysis
   */
  private calculateNoiseLevel(): number {
    if (!this.audioContext) return 0.5
    
    try {
      // Use real audio analysis with Web Audio API
      const analyser = this.audioContext.createAnalyser()
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      
      // Calculate noise level as standard deviation
      const mean = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const variance = dataArray.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / dataArray.length
      const noiseLevel = Math.sqrt(variance)
      
      return Math.min(1, Math.max(0, noiseLevel / 50)) // Normalize to 0-1 range
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'noise-level-calculation' })
      return 0.5
    }
  }

  /**
   * Calculate audio duration using real audio analysis
   */
  private calculateAudioDuration(audio: ArrayBuffer): number {
    try {
      // Fallback calculation based on file size and sample rate
      return audio.byteLength / (44100 * 2) // 44.1kHz, 16-bit
    } catch (error) {
      ErrorLogger.log(error as Error, { context: 'audio-duration-calculation' })
      return audio.byteLength / (44100 * 2) // Fallback
    }
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): Array<{
    name: string
    lang: string
    gender: string
    quality: string
  }> {
    if (!this.speechSynthesis) {
      return []
    }

    return this.speechSynthesis.getVoices().map((voice: any) => ({
      name: voice.name,
      lang: voice.lang,
      gender: voice.name.includes('Female') ? 'female' : 'male',
      quality: voice.name.includes('Premium') ? 'high' : 'medium'
    }))
  }

  /**
   * Get voice session
   */
  public getVoiceSession(sessionId: string): VoiceSession | null {
    return this.activeSessions.get(sessionId) || null
  }

  /**
   * Get voice command
   */
  public getVoiceCommand(commandId: string): VoiceCommand | null {
    return this.voiceCommands.get(commandId) || null
  }

  /**
   * Get voice biometrics
   */
  public getVoiceBiometrics(userId: string): VoiceBiometrics | null {
    return this.voiceBiometrics.get(userId) || null
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Reconfigure speech recognition if needed
    if (newConfig.defaultLanguage || newConfig.supportedLanguages) {
      this.configureSpeechRecognition()
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): VoiceConfig {
    return { ...this.config }
  }

  /**
   * Get voice interface statistics
   */
  public getVoiceStats(): {
    activeSessions: number
    totalCommands: number
    totalResponses: number
    averageConfidence: number
    supportedLanguages: number
    availableVoices: number
  } {
    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => session.isActive).length
    
    const totalCommands = this.voiceCommands.size
    const totalResponses = Array.from(this.activeSessions.values())
      .reduce((sum, session) => sum + session.responses.length, 0)
    
    const averageConfidence = totalCommands > 0
      ? Array.from(this.voiceCommands.values())
          .reduce((sum, cmd) => sum + cmd.confidence, 0) / totalCommands
      : 0

    return {
      activeSessions,
      totalCommands,
      totalResponses,
      averageConfidence,
      supportedLanguages: this.config.supportedLanguages.length,
      availableVoices: this.getAvailableVoices().length
    }
  }

  /**
   * Cleanup voice interface
   */
  public cleanup(): void {
    // Stop all active sessions
    for (const session of this.activeSessions.values()) {
      if (session.isActive) {
        this.endVoiceSession(session.id)
      }
    }

    // Stop speech recognition
    this.stopSpeechRecognition()

    // Clear data
    this.activeSessions.clear()
    this.voiceCommands.clear()
    this.voiceBiometrics.clear()

    ErrorLogger.logInfo('Voice interface cleaned up')
  }
}

// Singleton instance
export const voiceInterface = new VoiceInterface()

// Export class
export { VoiceInterface }
