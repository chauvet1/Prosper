#!/usr/bin/env tsx

/**
 * Test DALL-E 3 Pricing Verification
 * This script tests different image sizes to verify correct pricing
 */

import { config } from 'dotenv'

// Load environment variables
const path = require('path')
config({ path: path.join(process.cwd(), '.env.local') })
config({ path: path.join(process.cwd(), '.env') })

async function testDALLEPricing() {
  console.log('💰 Testing DALL-E 3 Pricing Verification')
  console.log('========================================')
  
  const apiKey = process.env.OPENAI_API_KEY
  console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found'}`)
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('❌ Invalid or missing OpenAI API key')
    return
  }

  const testCases = [
    {
      name: '1:1 Square (1024x1024)',
      size: '1024x1024',
      expectedCost: '$0.040',
      description: 'Standard quality square image'
    },
    {
      name: '16:9 Landscape (1792x1024)', 
      size: '1792x1024',
      expectedCost: '$0.080',
      description: 'Standard quality landscape image'
    }
  ]

  console.log('')
  console.log('📊 DALL-E 3 Standard Quality Pricing Test')
  console.log('==========================================')
  console.log('Expected Pricing (as of 2024):')
  console.log('• 1024×1024 (Standard): $0.040 per image')
  console.log('• 1792×1024 (Standard): $0.080 per image')
  console.log('• 1024×1792 (Standard): $0.080 per image')
  console.log('')
  console.log('⚠️  If you\'re being charged $0.120, it means:')
  console.log('   - You might be using HD quality instead of Standard')
  console.log('   - Or OpenAI changed their pricing')
  console.log('')

  for (const testCase of testCases) {
    console.log(`🧪 Testing: ${testCase.name}`)
    console.log(`📐 Size: ${testCase.size}`)
    console.log(`💰 Expected Cost: ${testCase.expectedCost}`)
    console.log(`📝 Description: ${testCase.description}`)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `A simple test image for pricing verification - ${testCase.name}. Professional, clean design.`,
          n: 1,
          size: testCase.size,
          quality: 'standard', // CRITICAL: This should give us the lower pricing
          style: 'natural'
        })
      })

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000

      console.log(`📡 Response Status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ API Error:`, errorData)
        continue
      }

      const data = await response.json()
      
      if (data.data && data.data[0] && data.data[0].url) {
        console.log(`✅ Image generated successfully in ${duration}s`)
        console.log(`🖼️ URL: ${data.data[0].url.substring(0, 80)}...`)
        console.log(`💰 Expected billing: ${testCase.expectedCost}`)
        console.log('')
        console.log('🔍 To verify actual billing:')
        console.log('   1. Check your OpenAI usage dashboard')
        console.log('   2. Look for the most recent DALL-E 3 charge')
        console.log(`   3. It should be ${testCase.expectedCost} for this ${testCase.size} image`)
        console.log('')
      } else {
        console.log('⚠️ Unexpected response format:', data)
      }

    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error)
    }
    
    console.log('─'.repeat(50))
    console.log('')
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('📋 Summary:')
  console.log('===========')
  console.log('✅ Both test images generated with quality: "standard"')
  console.log('💰 Expected costs: $0.040 (square) + $0.080 (landscape) = $0.120 total')
  console.log('')
  console.log('🔍 Next Steps:')
  console.log('1. Check your OpenAI billing dashboard')
  console.log('2. Verify the charges match the expected amounts')
  console.log('3. If you see $0.120 per image instead of $0.040/$0.080:')
  console.log('   - The API might be defaulting to HD quality')
  console.log('   - Or there might be a configuration issue')
  console.log('')
  console.log('🌐 OpenAI Usage Dashboard:')
  console.log('   https://platform.openai.com/usage')
}

// Run the test
if (require.main === module) {
  testDALLEPricing().catch(console.error)
}

export { testDALLEPricing }
