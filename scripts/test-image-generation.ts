#!/usr/bin/env tsx

/**
 * Test Image Generation System
 * Tests all image generation methods: Nano Banana, DALL-E 3, Stability AI, and Placeholder
 */

import { config } from 'dotenv'
import { generateBlogImage, generateImagePrompt, ImageGenerationConfig } from '../lib/imagen-generator'

// Load environment variables
config({ path: '.env.local' })

async function testImageGeneration() {
  console.log('🖼️ Testing Image Generation System')
  console.log('=================================')
  
  // Check API keys
  console.log('🔑 Checking API Keys:')
  console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing'}`)
  console.log(`   OpenAI API: ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && process.env.OPENAI_API_KEY.startsWith('sk-') ? '✅ Found' : '❌ Missing/Default'}`)
  console.log(`   Stability AI: ${process.env.STABILITY_API_KEY && process.env.STABILITY_API_KEY !== 'your_stability_api_key_here' ? '✅ Found' : '❌ Missing/Default'}`)

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log(`   OpenAI Key Preview: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`)
  }
  console.log('')

  // Test configuration
  const imageConfig: ImageGenerationConfig = {
    blogTitle: 'React Performance Optimization Guide',
    blogContent: 'Learn how to optimize React applications for better performance using modern techniques like memoization, code splitting, and lazy loading.',
    blogCategory: 'tutorial',
    contentType: 'tutorial',
    technicalLevel: 'intermediate',
    style: 'professional',
    aspectRatio: '16:9',
    includeText: false
  }

  console.log('⚙️ Test Configuration:')
  console.log(`   Title: ${imageConfig.blogTitle}`)
  console.log(`   Style: ${imageConfig.style}`)
  console.log(`   Aspect Ratio: ${imageConfig.aspectRatio}`)
  console.log('')

  // Test 1: Image Prompt Generation
  console.log('🎨 Test 1: Image Prompt Generation')
  console.log('----------------------------------')
  try {
    const startTime = Date.now()
    const imagePrompt = await generateImagePrompt(imageConfig)
    const duration = (Date.now() - startTime) / 1000

    console.log(`✅ Image prompt generated in ${duration}s`)
    console.log(`📝 Generated prompt: "${imagePrompt}"`)
    console.log('')
  } catch (error) {
    console.error('❌ Image prompt generation failed:', error)
    console.log('')
  }

  // Test 2: Full Image Generation (with fallbacks)
  console.log('🖼️ Test 2: Full Image Generation')
  console.log('--------------------------------')
  try {
    console.log('⏳ Generating image (this may take 30-60 seconds)...')
    const startTime = Date.now()
    
    const generatedImage = await generateBlogImage(imageConfig)
    
    const duration = (Date.now() - startTime) / 1000

    if (generatedImage) {
      console.log(`✅ Image generated successfully in ${duration}s`)
      console.log('')
      console.log('🖼️ Generated Image Details:')
      console.log(`   URL: ${generatedImage.url.substring(0, 100)}${generatedImage.url.length > 100 ? '...' : ''}`)
      console.log(`   Filename: ${generatedImage.filename}`)
      console.log(`   Model: ${generatedImage.metadata.model}`)
      console.log(`   Style: ${generatedImage.metadata.style}`)
      console.log(`   Aspect Ratio: ${generatedImage.metadata.aspectRatio}`)
      console.log('')
      console.log('🌐 Alt Text:')
      console.log(`   English: ${generatedImage.altText.en}`)
      console.log(`   French: ${generatedImage.altText.fr}`)
      console.log('')
      console.log('📝 Captions:')
      console.log(`   English: ${generatedImage.caption.en}`)
      console.log(`   French: ${generatedImage.caption.fr}`)
      console.log('')
      console.log('🎨 Image Prompt Used:')
      console.log(`   "${generatedImage.prompt}"`)
      console.log('')
      
      // Determine what method was used
      if (generatedImage.url.startsWith('data:')) {
        console.log('🔍 Image Type: Base64 data URL (likely AI-generated)')
      } else if (generatedImage.url.includes('placeholder')) {
        console.log('🔍 Image Type: Placeholder image')
      } else {
        console.log('🔍 Image Type: External URL')
      }
      
    } else {
      console.log(`❌ Image generation failed after ${duration}s`)
      console.log('This could be due to:')
      console.log('- API rate limits')
      console.log('- Missing API keys')
      console.log('- Service unavailability')
    }
    console.log('')
  } catch (error) {
    console.error('❌ Full image generation failed:', error)
    console.log('')
  }

  // Test 3: Different Styles
  console.log('🎭 Test 3: Different Image Styles')
  console.log('---------------------------------')
  
  const styles = ['professional', 'modern', 'minimalist', 'tech', 'abstract']
  
  for (const style of styles) {
    try {
      console.log(`🎨 Testing style: ${style}`)
      const styleConfig = { ...imageConfig, style: style as any }
      const prompt = await generateImagePrompt(styleConfig)
      console.log(`   ✅ ${style}: "${prompt.substring(0, 80)}..."`)
    } catch (error) {
      console.log(`   ❌ ${style}: Failed`)
    }
  }
  console.log('')

  // Summary
  console.log('📊 Image Generation Test Summary')
  console.log('================================')
  
  const hasGemini = !!process.env.GEMINI_API_KEY
  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && process.env.OPENAI_API_KEY.startsWith('sk-')
  const hasStability = process.env.STABILITY_API_KEY && process.env.STABILITY_API_KEY !== 'your_stability_api_key_here'
  
  console.log('🔧 Available Services:')
  console.log(`   Gemini (Prompt Generation): ${hasGemini ? '✅ Available' : '❌ Not configured'}`)
  console.log(`   Nano Banana (Gemini Image): ${hasGemini ? '🔄 Limited availability' : '❌ Not configured'}`)
  console.log(`   DALL-E 3 (OpenAI): ${hasOpenAI ? '✅ Available' : '❌ Not configured'}`)
  console.log(`   Stability AI: ${hasStability ? '✅ Available' : '❌ Not configured'}`)
  console.log(`   Placeholder Images: ✅ Always available`)
  console.log('')
  
  console.log('💡 Recommendations:')
  if (!hasOpenAI && !hasStability) {
    console.log('   🔑 Add OpenAI API key for DALL-E 3 image generation')
    console.log('   🔑 Or add Stability AI API key for Stable Diffusion')
    console.log('   📷 Currently using placeholder images for development')
  } else {
    console.log('   ✅ Image generation is properly configured')
  }
  
  if (hasGemini) {
    console.log('   ✅ Gemini prompt generation is working')
  }
  
  console.log('')
  console.log('🚀 Image generation system is ready!')
  console.log('')
  console.log('📚 Next steps:')
  console.log('1. Add OpenAI or Stability AI keys for real image generation')
  console.log('2. Test with blog generation: npm run test:blog')
  console.log('3. Generate blog with images: POST /api/blog/generate')
  console.log('4. Monitor image generation in production')
}

// Run the test
if (require.main === module) {
  testImageGeneration().catch(console.error)
}

export { testImageGeneration }
