import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI for image generation (Nano Banana)
let genAI: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required for image generation')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

export interface ImageGenerationConfig {
  blogTitle: string
  blogContent: string
  blogCategory: string
  contentType: 'tutorial' | 'analysis' | 'news' | 'opinion' | 'guide'
  technicalLevel: 'beginner' | 'intermediate' | 'advanced'
  style: 'professional' | 'modern' | 'minimalist' | 'tech' | 'abstract'
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16'
  includeText: boolean
}

export interface GeneratedImage {
  url: string
  prompt: string
  altText: {
    en: string
    fr: string
  }
  caption: {
    en: string
    fr: string
  }
  filename: string
  metadata: {
    style: string
    aspectRatio: string
    generatedAt: string
    model: string
    cost?: string
    quality?: string
  }
}

// Generate optimized image prompts using Gemini
export async function generateImagePrompt(config: ImageGenerationConfig): Promise<string> {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `
You are an expert at creating detailed, professional image generation prompts for technical blog posts.

**Blog Details:**
- Title: ${config.blogTitle}
- Category: ${config.blogCategory}
- Content Type: ${config.contentType}
- Technical Level: ${config.technicalLevel}
- Style Preference: ${config.style}
- Aspect Ratio: ${config.aspectRatio}
- Include Text: ${config.includeText ? 'Yes' : 'No'}

**Blog Content Preview:**
${config.blogContent.substring(0, 500)}...

**Requirements:**
Create a detailed image generation prompt that will produce a professional, visually appealing image for this blog post. The image should:

1. **Visual Style**: ${config.style} design aesthetic
2. **Technical Relevance**: Clearly relate to the blog topic
3. **Professional Quality**: Suitable for a developer portfolio blog
4. **Color Scheme**: Modern, tech-focused colors (blues, purples, greens, grays)
5. **Composition**: Clean, uncluttered, ${config.aspectRatio} aspect ratio
6. **Elements**: Include relevant tech icons, code elements, or abstract representations
${config.includeText ? '7. **Text Elements**: Include minimal, readable text that enhances the design' : '7. **No Text**: Pure visual design without text overlays'}

**Prompt Guidelines:**
- Be specific about colors, lighting, and composition
- Include technical elements relevant to the topic
- Specify professional, clean aesthetic
- Mention specific design elements (gradients, geometric shapes, etc.)
- Keep it concise but detailed (under 200 words)

Generate only the image prompt, no additional explanation:
`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()

  } catch (error) {
    console.error('Error generating image prompt:', error)
    // Fallback prompt
    return `Professional ${config.style} illustration for ${config.blogCategory} blog post about ${config.blogTitle}, clean modern design, tech-focused color palette, ${config.aspectRatio} aspect ratio, high quality, minimalist composition`
  }
}

// Generate alt text and captions using Gemini
export async function generateImageMetadata(
  imagePrompt: string, 
  blogTitle: string, 
  blogContent: string
): Promise<{
  altText: { en: string; fr: string }
  caption: { en: string; fr: string }
}> {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `
Create SEO-optimized alt text and captions for a blog post image.

**Image Prompt:** ${imagePrompt}
**Blog Title:** ${blogTitle}
**Blog Content Preview:** ${blogContent.substring(0, 300)}...

Generate JSON response with:
{
  "altText": {
    "en": "Descriptive alt text in English (50-125 characters, SEO-optimized)",
    "fr": "Descriptive alt text in French (50-125 characters, SEO-optimized)"
  },
  "caption": {
    "en": "Engaging caption in English (100-200 characters)",
    "fr": "Engaging caption in French (100-200 characters)"
  }
}

Requirements:
- Alt text should be descriptive and include relevant keywords
- Captions should be engaging and relate to the blog content
- Both should be professional and suitable for a developer blog
- French translations should be natural and culturally appropriate
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanResponse)

  } catch (error) {
    console.error('Error generating image metadata:', error)
    // Fallback metadata
    return {
      altText: {
        en: `Professional illustration for ${blogTitle}`,
        fr: `Illustration professionnelle pour ${blogTitle}`
      },
      caption: {
        en: `Visual representation of key concepts discussed in this ${blogTitle.toLowerCase()} guide`,
        fr: `Représentation visuelle des concepts clés discutés dans ce guide ${blogTitle.toLowerCase()}`
      }
    }
  }
}

// Main image generation function using DALL-E 3
export async function generateBlogImage(config: ImageGenerationConfig): Promise<GeneratedImage | null> {
  try {
    console.log('🖼️ Starting blog image generation with DALL-E 3...')

    // Step 1: Generate optimized image prompt (with fallback)
    let imagePrompt: string
    try {
      imagePrompt = await generateImagePrompt(config)
      console.log('✅ Generated image prompt:', imagePrompt)
    } catch (error) {
      console.log('⚠️ Failed to generate custom prompt, using fallback')
      imagePrompt = `Professional ${config.style} illustration for ${config.contentType} blog post about ${config.blogTitle}, clean modern design, tech-focused color palette, ${config.aspectRatio} aspect ratio, high quality, minimalist composition`
    }

    // Step 2: Generate image using DALL-E 3 as primary method
    const imageUrl = await generateWithDALLE(imagePrompt, config)

    // Step 3: Generate alt text and captions using smart fallback (no Gemini dependency)
    console.log('📝 Generating image metadata...')
    const metadata = {
      altText: {
        en: `Professional ${config.style} illustration for ${config.blogTitle}`,
        fr: `Illustration ${config.style} professionnelle pour ${config.blogTitle}`
      },
      caption: {
        en: `AI-generated visual representation of ${config.blogTitle} - ${config.contentType} for ${config.technicalLevel} level`,
        fr: `Représentation visuelle générée par IA de ${config.blogTitle} - ${config.contentType} pour niveau ${config.technicalLevel}`
      }
    }
    console.log('✅ Generated image metadata')

    // Step 4: Create filename
    const timestamp = new Date().toISOString().split('T')[0]
    const slugTitle = config.blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)
    const filename = `blog-${slugTitle}-${timestamp}.jpg`

    // Step 5: Create the complete image object
    const generatedImage: GeneratedImage = {
      url: imageUrl,
      prompt: imagePrompt,
      altText: metadata.altText,
      caption: metadata.caption,
      filename,
      metadata: {
        style: config.style,
        aspectRatio: config.aspectRatio,
        generatedAt: new Date().toISOString(),
        model: imageUrl.includes('placeholder') ? 'placeholder' : 'dall-e-3',
        cost: imageUrl.includes('placeholder') ? '$0.00' : (config.aspectRatio === '1:1' ? '$0.04' : '$0.08'),
        quality: 'standard'
      }
    }

    console.log('✅ Blog image generation completed successfully')
    return generatedImage

  } catch (error) {
    console.error('❌ DALL-E 3 generation failed, using placeholder:', error)

    // If DALL-E 3 fails, return a professional placeholder image object
    const timestamp = new Date().toISOString().split('T')[0]
    const slugTitle = config.blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)

    return {
      url: generatePlaceholderImage(config),
      prompt: `Professional ${config.style} illustration for ${config.contentType} blog post about ${config.blogTitle}`,
      altText: {
        en: `Professional ${config.style} illustration for ${config.blogTitle}`,
        fr: `Illustration ${config.style} professionnelle pour ${config.blogTitle}`
      },
      caption: {
        en: `Professional visual for "${config.blogTitle}" - ${config.contentType} guide`,
        fr: `Visuel professionnel pour "${config.blogTitle}" - guide ${config.contentType}`
      },
      filename: `blog-${slugTitle}-${timestamp}.jpg`,
      metadata: {
        style: config.style,
        aspectRatio: config.aspectRatio,
        generatedAt: new Date().toISOString(),
        model: 'placeholder',
        cost: '$0.00',
        quality: 'placeholder'
      }
    }
  }
}

// DALL-E 3 is now the primary image generation method
// Nano Banana (Gemini 2.5 Flash Image) removed in favor of cost-effective DALL-E 3

// DALL-E 3 is now the primary and only AI image generation method
// Fallback removed - direct placeholder generation on DALL-E failure

// Enhanced placeholder image generator for development
function generatePlaceholderImage(config: ImageGenerationConfig): string {
  const [width, height] = config.aspectRatio === '16:9' ? [1200, 675] :
                          config.aspectRatio === '4:3' ? [1200, 900] :
                          config.aspectRatio === '1:1' ? [1200, 1200] : [675, 1200]

  const encodedTitle = encodeURIComponent(config.blogTitle.substring(0, 50))
  const colors = {
    professional: '4F46E5,7C3AED',
    modern: '06B6D4,8B5CF6',
    minimalist: '6B7280,374151',
    tech: '3B82F6,10B981',
    abstract: 'F59E0B,EF4444'
  }

  const colorScheme = colors[config.style] || colors.professional
  const [bg, fg] = colorScheme.split(',')

  return `https://via.placeholder.com/${width}x${height}/${bg}/${fg}?text=${encodedTitle}+%7C+Nano+Banana+Placeholder`
}

// DALL-E 3 Primary Image Generation
async function generateWithDALLE(prompt: string, config: ImageGenerationConfig): Promise<string> {
  try {
    console.log('🎨 Generating image with DALL-E 3 Standard ($0.04-$0.08)...')

    // Optimize size selection for cost-effectiveness
    // 1024x1024 = $0.04, 1024x1792/1792x1024 = $0.08
    let size: string
    let estimatedCost: string

    switch (config.aspectRatio) {
      case '1:1':
        size = '1024x1024'
        estimatedCost = '$0.04'
        break
      case '16:9':
        size = '1792x1024'
        estimatedCost = '$0.08'
        break
      case '4:3':
        size = '1024x1792'
        estimatedCost = '$0.08'
        break
      default:
        size = '1024x1024'
        estimatedCost = '$0.04'
    }

    console.log(`💰 Using size ${size} (estimated cost: ${estimatedCost})`)

    // Optimize prompt for DALL-E 3 (max 4000 characters)
    const optimizedPrompt = prompt.substring(0, 4000)
    console.log(`📝 Prompt length: ${optimizedPrompt.length}/4000 characters`)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        n: 1,
        size: size,
        quality: 'standard', // Use standard quality for cost optimization
        style: (config.style === 'abstract' || config.style === 'modern') ? 'vivid' : 'natural'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`DALL-E API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Invalid response from DALL-E API')
    }

    console.log(`✅ DALL-E 3 image generated successfully (${estimatedCost})`)
    console.log(`🖼️ Image URL: ${data.data[0].url.substring(0, 100)}...`)

    return data.data[0].url

  } catch (error) {
    console.error('❌ DALL-E generation failed:', error)
    throw error
  }
}

// Stability AI removed - DALL-E 3 is the primary AI image generation method



// Batch image generation for multiple blog posts
export async function generateImagesForBlogPosts(posts: Array<{
  title: string
  content: string
  category: string
  contentType: string
}>): Promise<Array<GeneratedImage | null>> {
  const results = []
  
  for (const post of posts) {
    const config: ImageGenerationConfig = {
      blogTitle: post.title,
      blogContent: post.content,
      blogCategory: post.category,
      contentType: post.contentType as any,
      technicalLevel: 'intermediate',
      style: 'professional',
      aspectRatio: '16:9',
      includeText: false
    }
    
    const image = await generateBlogImage(config)
    results.push(image)
    
    // Add delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}

export default {
  generateBlogImage,
  generateImagePrompt,
  generateImageMetadata,
  generateImagesForBlogPosts
}
