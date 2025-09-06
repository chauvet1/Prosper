import { NextRequest, NextResponse } from 'next/server'
import { generateBlogPost, generateTopicSuggestions, generateSEOKeywords, GeminiBlogConfig } from '@/lib/gemini-blog-generator'
import { BlogService } from '@/lib/blog-service'

// POST /api/blog/generate - Generate a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const config: GeminiBlogConfig = body

    // Validate required fields
    if (!config.topic || !config.targetAudience || !config.contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, targetAudience, contentType' },
        { status: 400 }
      )
    }

    // Generate blog post with real AI
    console.log('🤖 Generating blog post with Gemini AI...')
    const generatedContent = await generateBlogPost(config)

    // Generate image if requested
    let generatedImage = null
    if (config.generateImage) {
      console.log('🖼️ Generating blog image...')
      try {
  const { generateBlogImage } = await import('@/lib/imagen-generator')

        // Pick a random accent color for signature style
        const accentColors = ['cyan', 'crimson', 'amber'] as const;
        const accentColor = accentColors[Math.floor(Math.random() * accentColors.length)];

  const imageConfig = {
          blogTitle: generatedContent.title.en,
          blogContent: generatedContent.excerpt.en,
          blogCategory: config.contentType,
          contentType: config.contentType,
          technicalLevel: config.technicalLevel,
          style: config.imageStyle || 'professional',
          aspectRatio: config.imageAspectRatio || '16:9',
          includeText: false,
          accentColor,
          seoKeywords: generatedContent.suggestedKeywords || []
        }

        generatedImage = await generateBlogImage(imageConfig)
        if (generatedImage) {
          console.log('✅ Blog image generated successfully')
        } else {
          console.log('⚠️ Blog image generation failed, continuing without image')
        }
      } catch (error) {
        console.error('❌ Error generating blog image:', error)
      }
    }

    // Save to database using BlogService
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
      featured: Math.random() > 0.7, // 30% chance of being featured
      aiGenerated: true,
      generationConfig: config,
      aiModel: 'gemini-1.5-pro',
      readTime: generatedContent.readTime,
      seoScore: 85, // Default good SEO score for AI-generated content
      // Include image data if generated
      featuredImageUrl: generatedImage?.url,
      featuredImageAltEn: generatedImage?.altText.en,
      featuredImageAltFr: generatedImage?.altText.fr,
      featuredImagePrompt: generatedImage?.prompt,
      imageGenerationConfig: generatedImage ? {
        style: generatedImage.metadata.style,
        aspectRatio: generatedImage.metadata.aspectRatio,
        model: generatedImage.metadata.model
      } : undefined
    })

    if (!postId) {
      throw new Error('Failed to save generated blog post to database')
    }

    // Save image to blog_images table if generated
    let imageId = null
    if (generatedImage && postId) {
      console.log('💾 Saving image to database...')
      imageId = await BlogService.saveImage({
        blogPostId: postId,
        url: generatedImage.url,
        filename: generatedImage.filename,
        prompt: generatedImage.prompt,
        altTextEn: generatedImage.altText.en,
        altTextFr: generatedImage.altText.fr,
        captionEn: generatedImage.caption.en,
        captionFr: generatedImage.caption.fr,
        style: generatedImage.metadata.style,
        aspectRatio: generatedImage.metadata.aspectRatio,
        model: generatedImage.metadata.model,
        generatedAt: generatedImage.metadata.generatedAt
      })

      if (imageId) {
        console.log(`✅ Image saved to database with ID: ${imageId}`)
      } else {
        console.log('⚠️ Failed to save image to database')
      }
    }

    // Get the saved post
    const savedPost = await BlogService.getPostById(postId)

    return NextResponse.json({
      success: true,
      blogPost: savedPost,
      postId,
      imageId,
      image: generatedImage ? {
        url: generatedImage.url,
        filename: generatedImage.filename,
        altText: generatedImage.altText,
        caption: generatedImage.caption,
        metadata: generatedImage.metadata
      } : null,
      message: `Blog post generated and saved successfully${generatedImage ? ' with image' : ''}`,
      aiGenerated: true,
      model: 'gemini-1.5-pro',
      imageGenerated: !!generatedImage
    })

  } catch (error) {
    console.error('Error generating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    )
  }
}

// GET /api/blog/generate/topics - Get topic suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'web development'
    const count = parseInt(searchParams.get('count') || '10')

    const topics = await generateTopicSuggestions(category, count)

    return NextResponse.json({
      success: true,
      topics,
      category,
      count: topics.length
    })

  } catch (error) {
    console.error('Error generating topics:', error)
    return NextResponse.json(
      { error: 'Failed to generate topic suggestions' },
      { status: 500 }
    )
  }
}
