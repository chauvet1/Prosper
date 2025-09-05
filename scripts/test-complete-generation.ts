#!/usr/bin/env tsx

/**
 * Test Complete Blog Generation with DALL-E 3 Images and Database Saving
 * This tests the full pipeline: content + images + database storage
 */

import { config } from 'dotenv'
import { generateBlogImage, ImageGenerationConfig } from '../lib/imagen-generator'
import { BlogService } from '../lib/blog-service'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

async function testCompleteGeneration() {
  console.log('🚀 Testing Complete Blog Generation Pipeline')
  console.log('============================================')
  console.log('📝 Content: Fallback (Gemini rate limited)')
  console.log('🎨 Images: DALL-E 3 Standard ($0.04-$0.08)')
  console.log('💾 Database: Prisma Accelerate')
  console.log('')

  try {
    // Step 1: Create blog post content (using fallback since Gemini is rate limited)
    console.log('📝 Step 1: Creating blog post content...')
    const timestamp = Date.now()
    const blogData = {
      titleEn: `React Performance Optimization with DALL-E 3 - ${timestamp}`,
      titleFr: `Optimisation des performances React avec DALL-E 3 - ${timestamp}`,
      excerptEn: 'Learn advanced React performance optimization techniques with real-world examples and AI-generated visuals.',
      excerptFr: 'Apprenez les techniques avancées d\'optimisation des performances React avec des exemples concrets et des visuels générés par IA.',
      contentEn: `# React Performance Optimization Guide

## Introduction
React applications can become slow as they grow. This comprehensive guide covers essential optimization techniques.

## Key Techniques
1. **Memoization** - Use React.memo and useMemo
2. **Code Splitting** - Lazy load components
3. **Virtual Scrolling** - Handle large lists efficiently
4. **Bundle Analysis** - Identify performance bottlenecks

## Implementation Examples
\`\`\`jsx
const OptimizedComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => 
    computeExpensiveValue(data), [data]
  );
  
  return <div>{expensiveValue}</div>;
});
\`\`\`

## Conclusion
Implementing these techniques will significantly improve your React app's performance.`,
      contentFr: `# Guide d'optimisation des performances React

## Introduction
Les applications React peuvent devenir lentes à mesure qu'elles grandissent. Ce guide complet couvre les techniques d'optimisation essentielles.

## Techniques clés
1. **Mémorisation** - Utilisez React.memo et useMemo
2. **Division du code** - Chargement paresseux des composants
3. **Défilement virtuel** - Gérer efficacement les grandes listes
4. **Analyse des bundles** - Identifier les goulots d'étranglement

## Exemples d'implémentation
\`\`\`jsx
const OptimizedComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => 
    computeExpensiveValue(data), [data]
  );
  
  return <div>{expensiveValue}</div>;
});
\`\`\`

## Conclusion
L'implémentation de ces techniques améliorera considérablement les performances de votre application React.`,
      metaDescriptionEn: 'Complete guide to React performance optimization with practical examples and AI-generated visuals.',
      metaDescriptionFr: 'Guide complet pour l\'optimisation des performances React avec des exemples pratiques et des visuels générés par IA.',
      keywords: ['react', 'performance', 'optimization', 'memoization', 'code-splitting'],
      tags: ['React', 'Performance', 'JavaScript', 'Frontend'],
      category: 'tutorial',
      contentType: 'tutorial',
      technicalLevel: 'intermediate',
      targetAudience: 'developers',
      featured: true,
      aiGenerated: true,
      aiModel: 'dall-e-3',
      readTime: 8,
      seoScore: 90
    }

    const postId = await BlogService.createPost(blogData)
    
    if (!postId) {
      throw new Error('Failed to create blog post')
    }
    
    console.log(`✅ Blog post created with ID: ${postId}`)
    console.log('')

    // Step 2: Generate DALL-E 3 image
    console.log('🎨 Step 2: Generating DALL-E 3 image...')
    const imageConfig: ImageGenerationConfig = {
      blogTitle: blogData.titleEn,
      blogContent: blogData.excerptEn,
      blogCategory: 'tutorial',
      contentType: 'tutorial',
      technicalLevel: 'intermediate',
      style: 'professional',
      aspectRatio: '16:9',
      includeText: false
    }

    const startTime = Date.now()
    const generatedImage = await generateBlogImage(imageConfig)
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    if (!generatedImage) {
      throw new Error('Failed to generate image')
    }

    console.log(`✅ DALL-E 3 image generated in ${duration}s`)
    console.log(`💰 Cost: ${generatedImage.metadata.cost}`)
    console.log(`🖼️ URL: ${generatedImage.url.substring(0, 100)}...`)
    console.log('')

    // Step 3: Save image to database
    console.log('💾 Step 3: Saving image to database...')
    const imageId = await BlogService.saveImage({
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
      model: generatedImage.metadata.model || 'dall-e-3',
      generatedAt: generatedImage.metadata.generatedAt,
      generationConfig: {
        model: generatedImage.metadata.model || 'dall-e-3',
        style: generatedImage.metadata.style,
        aspectRatio: generatedImage.metadata.aspectRatio,
        cost: generatedImage.metadata.cost,
        quality: generatedImage.metadata.quality,
        prompt: generatedImage.prompt,
        generatedAt: generatedImage.metadata.generatedAt
      }
    })

    if (!imageId) {
      throw new Error('Failed to save image to database')
    }

    console.log(`✅ Image saved to database with ID: ${imageId}`)
    console.log('')

    // Step 4: Verify everything was saved
    console.log('🔍 Step 4: Verifying database storage...')
    const savedPost = await BlogService.getPostById(postId)
    const savedImages = await BlogService.getPostImages(postId)

    if (savedPost && savedImages.length > 0) {
      console.log('✅ Verification successful!')
      console.log('')
      console.log('📊 Final Results:')
      console.log('================')
      console.log(`📝 Blog Post: "${savedPost.title.en}"`)
      console.log(`🆔 Post ID: ${postId}`)
      console.log(`🖼️ Images: ${savedImages.length} saved`)
      console.log(`🆔 Image ID: ${imageId}`)
      console.log(`💰 Total Cost: ${generatedImage.metadata.cost}`)
      console.log(`⏱️ Generation Time: ${duration}s`)
      console.log(`🎨 Model: ${generatedImage.metadata.model}`)
      console.log(`📐 Size: ${generatedImage.metadata.aspectRatio}`)
      console.log('')
      console.log('🎉 Complete pipeline test successful!')
      console.log('')
      console.log('🚀 Your system is ready for production:')
      console.log('✅ Real AI content generation (when Gemini quota resets)')
      console.log('✅ Real AI image generation with DALL-E 3')
      console.log('✅ Database storage with Prisma Accelerate')
      console.log('✅ Cost tracking and metadata')
      console.log('✅ Bilingual support')
      console.log('✅ Professional fallbacks')
    } else {
      console.log('❌ Verification failed - data not found in database')
    }

  } catch (error) {
    console.error('❌ Complete generation test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testCompleteGeneration().catch(console.error)
}

export { testCompleteGeneration }
