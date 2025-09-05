import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { BlogService } from './blog-service'
import { generateBlogImage, ImageGenerationConfig } from './imagen-generator'

// Initialize Gemini AI with lazy loading
let genAI: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

export interface GeminiBlogConfig {
  topic: string
  targetAudience: 'developers' | 'clients' | 'general'
  contentType: 'tutorial' | 'analysis' | 'news' | 'opinion' | 'guide'
  technicalLevel: 'beginner' | 'intermediate' | 'advanced'
  includeCode: boolean
  wordCount: number
  seoKeywords: string[]
  tone: 'professional' | 'casual' | 'technical' | 'friendly'
  generateImage: boolean
  imageStyle?: 'professional' | 'modern' | 'minimalist' | 'tech' | 'abstract'
  imageAspectRatio?: '16:9' | '4:3' | '1:1' | '9:16'
}

export interface GeneratedContent {
  title: { en: string; fr: string }
  excerpt: { en: string; fr: string }
  content: { en: string; fr: string }
  tags: string[]
  seoMetaDescription: { en: string; fr: string }
  suggestedKeywords: string[]
  readTime: number
}

// System prompts for different content types
const SYSTEM_PROMPTS = {
  tutorial: `You are an expert full-stack developer and technical writer. Create comprehensive, step-by-step tutorials that are practical and actionable. Include code examples, best practices, and common pitfalls to avoid.`,
  
  analysis: `You are a senior software architect and industry analyst. Provide deep technical analysis with insights into trends, performance comparisons, and strategic recommendations.`,
  
  news: `You are a tech journalist specializing in web development. Create engaging news content that explains the impact and implications of new technologies and industry developments.`,
  
  opinion: `You are a thought leader in web development. Share informed opinions backed by experience, data, and industry knowledge. Be authentic and provide unique perspectives.`,
  
  guide: `You are a mentor and educator. Create comprehensive guides that help developers solve real-world problems and advance their careers.`
}

// Content generation prompts
const generateContentPrompt = (config: GeminiBlogConfig, language: 'en' | 'fr') => {
  const languageInstructions = language === 'fr' 
    ? 'Répondez en français avec un style naturel et professionnel adapté au public francophone.'
    : 'Respond in English with a professional yet accessible tone.'

  return `
${SYSTEM_PROMPTS[config.contentType]}

${languageInstructions}

Create a ${config.contentType} blog post with the following specifications:

**Topic**: ${config.topic}
**Target Audience**: ${config.targetAudience}
**Technical Level**: ${config.technicalLevel}
**Word Count**: Approximately ${config.wordCount} words
**Tone**: ${config.tone}
**Include Code Examples**: ${config.includeCode ? 'Yes' : 'No'}
**SEO Keywords to include**: ${config.seoKeywords.join(', ')}

**Content Structure Requirements:**
1. **Compelling Title**: Create an engaging, SEO-optimized title
2. **Engaging Excerpt**: Write a 2-3 sentence summary that hooks the reader
3. **Main Content**: 
   - Start with a strong introduction
   - Use clear headings and subheadings
   - Include practical examples and actionable advice
   ${config.includeCode ? '- Provide relevant code examples with explanations' : ''}
   - End with a strong conclusion and call-to-action
4. **SEO Meta Description**: Create a compelling 150-160 character meta description
5. **Tags**: Suggest 5-7 relevant tags
6. **Keywords**: Provide additional SEO keyword suggestions

**Content Guidelines:**
- Write for ${config.targetAudience} audience
- Maintain ${config.technicalLevel} technical level
- Use ${config.tone} tone throughout
- Ensure content is original and valuable
- Include current best practices and trends
- Make it actionable and practical

**Format your response as JSON:**
{
  "title": "Your compelling title here",
  "excerpt": "Your engaging excerpt here",
  "content": "Your full blog post content in markdown format",
  "metaDescription": "Your SEO meta description",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
`
}

// Generate blog post using Gemini
export async function generateBlogPost(config: GeminiBlogConfig): Promise<GeneratedContent> {
  try {
    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })

    // Generate English content
    const englishPrompt = generateContentPrompt(config, 'en')
    const englishResult = await model.generateContent(englishPrompt)
    const englishResponse = englishResult.response.text()
    
    // Generate French content
    const frenchPrompt = generateContentPrompt(config, 'fr')
    const frenchResult = await model.generateContent(frenchPrompt)
    const frenchResponse = frenchResult.response.text()

    // Parse JSON responses
    const englishContent = parseGeminiResponse(englishResponse)
    const frenchContent = parseGeminiResponse(frenchResponse)

    // Calculate read time (average 200 words per minute)
    const wordCount = englishContent.content.split(' ').length
    const readTime = Math.ceil(wordCount / 200)

    return {
      title: {
        en: englishContent.title,
        fr: frenchContent.title
      },
      excerpt: {
        en: englishContent.excerpt,
        fr: frenchContent.excerpt
      },
      content: {
        en: englishContent.content,
        fr: frenchContent.content
      },
      tags: englishContent.tags,
      seoMetaDescription: {
        en: englishContent.metaDescription,
        fr: frenchContent.metaDescription
      },
      suggestedKeywords: englishContent.keywords,
      readTime
    }
  } catch (error) {
    console.error('Error generating blog post:', error)
    throw new Error('Failed to generate blog post with Gemini AI')
  }
}

// Parse Gemini response and extract JSON
function parseGeminiResponse(response: string): any {
  try {
    // Remove markdown code blocks if present
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanResponse)
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
    throw new Error('Failed to parse AI response')
  }
}

// Generate topic suggestions
export async function generateTopicSuggestions(category: string, count: number = 10): Promise<string[]> {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
As an expert in web development and technology, suggest ${count} compelling blog post topics for the category: ${category}.

Topics should be:
- Current and relevant to 2024/2025
- Valuable for developers and potential clients
- SEO-friendly and searchable
- Actionable and practical
- Suitable for a full-stack developer's portfolio blog

Return only the topic titles, one per line, without numbering or bullets.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    return response.split('\n').filter((topic: string) => topic.trim().length > 0).slice(0, count)
  } catch (error) {
    console.error('Error generating topic suggestions:', error)
    return []
  }
}

// SEO keyword research
export async function generateSEOKeywords(topic: string, count: number = 20): Promise<string[]> {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
As an SEO expert, generate ${count} relevant keywords for the blog topic: "${topic}"

Include:
- Primary keywords (high search volume)
- Long-tail keywords (specific phrases)
- Related semantic keywords
- Technical terms relevant to web development
- Question-based keywords

Return only the keywords, one per line, without explanations.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    return response.split('\n').filter((keyword: string) => keyword.trim().length > 0).slice(0, count)
  } catch (error) {
    console.error('Error generating SEO keywords:', error)
    return []
  }
}

// Content optimization suggestions
export async function optimizeContent(content: string, targetKeywords: string[]): Promise<{
  suggestions: string[]
  seoScore: number
  improvements: string[]
}> {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    const prompt = `
As an SEO and content optimization expert, analyze this blog post content and provide optimization suggestions.

**Content to analyze:**
${content}

**Target Keywords:**
${targetKeywords.join(', ')}

**Provide analysis in JSON format:**
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "seoScore": 85,
  "improvements": ["improvement1", "improvement2", "improvement3"]
}

Analyze:
- Keyword density and placement
- Content structure and readability
- Meta optimization opportunities
- Internal linking possibilities
- Content gaps or missing information
- Technical SEO improvements
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    return parseGeminiResponse(response)
  } catch (error) {
    console.error('Error optimizing content:', error)
    return {
      suggestions: [],
      seoScore: 0,
      improvements: []
    }
  }
}

// Automated blog scheduling
export async function scheduleAutomatedBlog(): Promise<void> {
  const topics = [
    'Modern React Patterns and Best Practices',
    'Next.js 14 Performance Optimization Techniques',
    'TypeScript Advanced Types for Better Code',
    'Building Scalable APIs with Node.js',
    'AI Integration in Web Development',
    'Database Design Patterns for Modern Apps',
    'Cloud Deployment Strategies for Full-Stack Apps',
    'Web Security Best Practices for Developers',
    'Mobile-First Development with React Native',
    'DevOps Automation for Small Teams'
  ]

  // Select random topic
  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  
  // Generate SEO keywords
  const keywords = await generateSEOKeywords(randomTopic, 10)
  
  // Configure blog generation
  const config: GeminiBlogConfig = {
    topic: randomTopic,
    targetAudience: 'developers',
    contentType: 'tutorial',
    technicalLevel: 'intermediate',
    includeCode: true,
    wordCount: 1500,
    seoKeywords: keywords.slice(0, 5),
    tone: 'professional',
    generateImage: true,
    imageStyle: 'professional',
    imageAspectRatio: '16:9'
  }

  // Generate content
  const generatedContent = await generateBlogPost(config)
  
  // Generate AI image if requested
  let featuredImageUrl = null
  let featuredImageAltEn = null
  let featuredImageAltFr = null
  let featuredImagePrompt = null
  let imageGenerationConfig = null

  if (config.generateImage) {
    console.log('Generating AI image for blog post...')

    const imageConfig: ImageGenerationConfig = {
      blogTitle: generatedContent.title.en,
      blogContent: generatedContent.content.en,
      blogCategory: config.contentType,
      contentType: config.contentType,
      technicalLevel: config.technicalLevel,
      style: config.imageStyle || 'professional',
      aspectRatio: config.imageAspectRatio || '16:9',
      includeText: false
    }

    const generatedImage = await generateBlogImage(imageConfig)

    if (generatedImage) {
      featuredImageUrl = generatedImage.url
      featuredImageAltEn = generatedImage.altText.en
      featuredImageAltFr = generatedImage.altText.fr
      featuredImagePrompt = generatedImage.prompt
      imageGenerationConfig = generatedImage.metadata
      console.log('✅ AI image generated successfully:', generatedImage.filename)
    } else {
      console.log('⚠️ Failed to generate AI image, proceeding without image')
    }
  }

  // Save to database using Prisma
  const postId = await BlogService.createPost({
    titleEn: generatedContent.title.en,
    titleFr: generatedContent.title.fr,
    excerptEn: generatedContent.excerpt.en,
    excerptFr: generatedContent.excerpt.fr,
    contentEn: generatedContent.content.en,
    contentFr: generatedContent.content.fr,
    metaDescriptionEn: generatedContent.seoMetaDescription.en,
    metaDescriptionFr: generatedContent.seoMetaDescription.fr,
    keywords: generatedContent.suggestedKeywords,
    tags: generatedContent.tags,
    category: config.contentType,
    contentType: config.contentType,
    technicalLevel: config.technicalLevel,
    targetAudience: config.targetAudience,
    readTime: generatedContent.readTime,
    wordCount: generatedContent.content.en.split(' ').length,
    featured: Math.random() > 0.7, // 30% chance of being featured
    aiGenerated: true,
    generationConfig: config,
    aiModel: 'gemini-1.5-pro',
    seoScore: 85, // Default good SEO score for AI-generated content
    featuredImageUrl: featuredImageUrl || undefined,
    featuredImageAltEn: featuredImageAltEn || undefined,
    featuredImageAltFr: featuredImageAltFr || undefined,
    featuredImagePrompt: featuredImagePrompt || undefined,
    imageGenerationConfig: imageGenerationConfig || undefined
  })

  console.log('Generated and saved blog post:', generatedContent.title.en, 'ID:', postId)
}
