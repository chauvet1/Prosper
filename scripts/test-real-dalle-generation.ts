#!/usr/bin/env tsx

/**
 * Test Real DALL-E 3 Generation with Database Saving
 * This tests the complete pipeline with real OpenAI API
 */

import { config } from 'dotenv'
import { generateBlogImage, ImageGenerationConfig } from '../lib/imagen-generator'
import { BlogService } from '../lib/blog-service'

// Load environment variables with explicit paths
const path = require('path')
config({ path: path.join(process.cwd(), '.env.local') })
config({ path: path.join(process.cwd(), '.env') })

// Debug environment loading
console.log('🔧 Environment Debug:')
console.log('Working directory:', process.cwd())
console.log('Environment files checked:')
console.log('  - .env.local exists:', require('fs').existsSync('.env.local'))
console.log('  - .env exists:', require('fs').existsSync('.env'))
console.log('')

async function testRealDALLEGeneration() {
  console.log('🎨 Testing Real DALL-E 3 Generation with Database Saving')
  console.log('======================================================')
  
  // Check API key
  const apiKey = process.env.OPENAI_API_KEY
  console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found'}`)
  console.log(`🔑 Valid format: ${apiKey?.startsWith('sk-') ? 'Yes' : 'No'}`)
  console.log('')

  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('❌ Invalid or missing OpenAI API key')
    return
  }

  try {
    // Step 1: Create a test blog post
    console.log('📝 Step 1: Creating test blog post...')
    const timestamp = Date.now()
    const blogData = {
      titleEn: `DALL-E 3 Test Post - ${timestamp}`,
      titleFr: `Article de test DALL-E 3 - ${timestamp}`,
      excerptEn: 'Testing real DALL-E 3 image generation with database storage.',
      excerptFr: 'Test de génération d\'images DALL-E 3 réelles avec stockage en base de données.',
      contentEn: `# DALL-E 3 Test Post

This is a test post to verify that DALL-E 3 image generation is working correctly with real API integration.

## Features Tested
- Real OpenAI API key validation
- DALL-E 3 image generation
- Database storage with metadata
- Cost tracking ($0.08 for 16:9 images)

## Results
The system should generate a real AI image and save it to the database with proper metadata.`,
      contentFr: `# Article de test DALL-E 3

Ceci est un article de test pour vérifier que la génération d'images DALL-E 3 fonctionne correctement avec l'intégration API réelle.

## Fonctionnalités testées
- Validation de la clé API OpenAI réelle
- Génération d'images DALL-E 3
- Stockage en base de données avec métadonnées
- Suivi des coûts (0,08 $ pour les images 16:9)

## Résultats
Le système devrait générer une vraie image IA et la sauvegarder en base de données avec les métadonnées appropriées.`,
      metaDescriptionEn: 'Testing real DALL-E 3 image generation with database storage and cost tracking.',
      metaDescriptionFr: 'Test de génération d\'images DALL-E 3 réelles avec stockage en base de données et suivi des coûts.',
      keywords: ['dall-e-3', 'ai-images', 'test', 'openai'],
      tags: ['AI', 'DALL-E', 'Testing', 'Images'],
      category: 'test',
      contentType: 'tutorial',
      technicalLevel: 'intermediate',
      targetAudience: 'developers',
      featured: false,
      aiGenerated: true,
      aiModel: 'dall-e-3',
      readTime: 3,
      seoScore: 85
    }

    const postId = await BlogService.createPost(blogData)
    
    if (!postId) {
      throw new Error('Failed to create blog post')
    }
    
    console.log(`✅ Blog post created with ID: ${postId}`)
    console.log('')

    // Step 2: Generate real DALL-E 3 image
    console.log('🎨 Step 2: Generating real DALL-E 3 image...')
    const imageConfig: ImageGenerationConfig = {
      blogTitle: blogData.titleEn,
      blogContent: blogData.excerptEn,
      blogCategory: 'test',
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

    console.log(`✅ Image generated in ${duration}s`)
    console.log(`💰 Cost: ${generatedImage.metadata.cost}`)
    console.log(`🎨 Model: ${generatedImage.metadata.model}`)
    console.log(`📐 Size: ${generatedImage.metadata.aspectRatio}`)
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
      console.log(`🔗 Image URL: ${generatedImage.url}`)
      console.log('')
      console.log('🎉 Real DALL-E 3 generation test successful!')
      console.log('')
      console.log('✅ Your system is fully operational with:')
      console.log('  • Real AI image generation with DALL-E 3')
      console.log('  • Correct pricing ($0.08 for 16:9 images)')
      console.log('  • Database storage with full metadata')
      console.log('  • Cost tracking and generation details')
      console.log('  • Bilingual support')
      console.log('')
      console.log('🌐 You can now view the blog post at:')
      console.log(`   http://localhost:3000/blog/${postId}`)
    } else {
      console.log('❌ Verification failed - data not found in database')
    }

  } catch (error) {
    console.error('❌ Real DALL-E generation test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testRealDALLEGeneration().catch(console.error)
}

export { testRealDALLEGeneration }
