#!/usr/bin/env tsx

/**
 * Direct DALL-E 3 Test
 * Tests DALL-E 3 API directly to verify the API key works
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' }) // Also try .env file

async function testDALLEDirect() {
  console.log('🎨 Testing DALL-E 3 API Directly')
  console.log('===============================')
  
  // Check API key
  const apiKey = process.env.OPENAI_API_KEY
  console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found'}`)
  console.log(`🔑 Starts with sk-: ${apiKey?.startsWith('sk-') ? 'Yes' : 'No'}`)
  console.log('')

  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('❌ Invalid or missing OpenAI API key')
    console.log('Make sure your .env.local file contains a valid OpenAI API key starting with sk-')
    return
  }

  try {
    console.log('🖼️ Generating test image with DALL-E 3...')
    
    const prompt = "A professional, clean blog header image for a React performance optimization tutorial. Modern design with blue and teal colors, showing abstract code elements and performance graphs. 16:9 aspect ratio."
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard', // Enforce standard for $0.08 pricing
        style: 'natural'
      })
    })

    console.log(`📡 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ DALL-E API error:', errorData)
      return
    }

    const data = await response.json()
    
    if (data.data && data.data[0] && data.data[0].url) {
      console.log('✅ DALL-E 3 image generated successfully!')
      console.log(`🖼️ Image URL: ${data.data[0].url}`)
      console.log('')
      console.log('🎉 Your OpenAI API key is working correctly!')
      console.log('The image generation system should now work with real AI images.')
    } else {
      console.log('⚠️ Unexpected response format:', data)
    }

  } catch (error) {
    console.error('❌ Error testing DALL-E:', error)
  }
}

// Run the test
if (require.main === module) {
  testDALLEDirect().catch(console.error)
}

export { testDALLEDirect }
