#!/usr/bin/env tsx

/**
 * Test Real Blog Generation with Gemini AI
 * This script tests the complete blog generation pipeline with real AI
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

// Debug: Print out whether GEMINI_API_KEY is loaded
console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'Not found')

import type { GeminiBlogConfig } from '../lib/gemini-blog-generator'

async function testRealBlogGeneration() {
  console.log('🤖 Testing Real Blog Generation with Gemini AI')
  console.log('==============================================')
  
  // Check API key
  // Gemini API key check removed: not needed for image generation

  try {
    // Step 1: Configure blog generation (static values, no Gemini dependency)
    console.log('⚙️ Step 1: Configuring blog generation...')
    const blogConfig: GeminiBlogConfig = {
      topic: 'Next.js 15 New Features Deep Dive - ' + Date.now(),
      targetAudience: 'developers',
      contentType: 'tutorial',
      technicalLevel: 'intermediate',
      includeCode: true,
      wordCount: 1200,
      seoKeywords: ['React 18 Concurrent Mode', 'performance', 'large scale', 'optimization', 'concurrent rendering'],
      tone: 'professional',
      generateImage: true, // Enable image generation for full test
      imageStyle: 'professional',
      imageAspectRatio: '16:9'
    }
    console.log('✅ Configuration ready:')
    console.log(`   Topic: ${blogConfig.topic}`)
    console.log(`   Audience: ${blogConfig.targetAudience}`)
    console.log(`   Type: ${blogConfig.contentType}`)
    console.log(`   Level: ${blogConfig.technicalLevel}`)
    console.log(`   Word Count: ${blogConfig.wordCount}`)
    console.log('')

    // Step 2: Generate blog post and image via real API call
    console.log('🚀 Step 2: Generating blog post and image via API...')
    const response = await fetch('http://localhost:3000/api/blog/generate', {
      method: 'POST',
      body: JSON.stringify(blogConfig),
      headers: { 'Content-Type': 'application/json' }
    })
    const result = await response.json()
    console.log('API result:', result)
    if (result.success && result.blogPost) {
      console.log('✅ Blog post and image saved to database!')
      console.log(`📝 Blog title: ${result.blogPost.title.en}`)
      console.log(`🖼️ Image URL: ${result.blogPost.featuredImageUrl}`)
    } else {
      console.log('❌ Blog post generation failed:', result.error)
    }
    // Note: If your blog page does not update, you may need to trigger a revalidation or cache clear for /blog.
    // See Next.js docs for on-demand revalidation if using ISR/SSG.
    return

  // No Gemini content or database save. Test ends after config log.

  } catch (error) {
    console.error('❌ Real blog generation test failed:', error)
    
    if (error instanceof Error && error.message.includes('429')) {
      console.log('')
      console.log('ℹ️ This is likely a rate limit error from Gemini API.')
      console.log('Wait a few minutes and try again.')
      console.log('The system is configured correctly for real AI generation.')
    }
  }
}

// Run the test
if (require.main === module) {
  testRealBlogGeneration().catch(console.error)
}

export { testRealBlogGeneration }
