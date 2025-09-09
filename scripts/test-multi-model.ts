// Test script for multi-model AI system
import aiModelManager from '../lib/ai-model-manager'

async function testMultiModelSystem() {
  console.log('🤖 Testing Gemini Flash Models System\n')

  // Test 1: Check initial model status
  console.log('📊 Initial Model Status:')
  const initialStatus = aiModelManager.getModelStatus()
  initialStatus.forEach(model => {
    const priority = model.id === 'gemini-2.5-flash' ? '🥇' :
                    model.id === 'gemini-1.5-flash' ? '🥈' :
                    model.id === 'gemini-1.5-flash-8b' ? '🥉' : '🔧'
    console.log(`  ${priority} ${model.name}: ${model.isAvailable ? '✅' : '❌'} (${model.quotaPercentage.toFixed(1)}% quota used)`)
  })
  console.log('')

  // Test 2: Simple AI response
  console.log('💬 Testing AI Response Generation:')
  try {
    const response1 = await aiModelManager.generateResponse(
      'Hello, can you help me with web development?',
      'services'
    )
    console.log(`✅ Response from ${response1.model}:`)
    console.log(`   "${response1.content.substring(0, 100)}..."`)
    console.log(`   Tokens: ${response1.tokensUsed}, Cost: $${response1.cost.toFixed(4)}, Time: ${response1.responseTime}ms`)
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
  console.log('')

  // Test 3: Multiple requests to test fallback
  console.log('🔄 Testing Multiple Requests (Fallback System):')
  const testMessages = [
    'What services do you offer?',
    'How much does a web application cost?',
    'Can you help with mobile app development?',
    'Tell me about your AI solutions',
    'What technologies do you use?'
  ]

  for (let i = 0; i < testMessages.length; i++) {
    try {
      const response = await aiModelManager.generateResponse(testMessages[i], 'services')
      console.log(`  ${i + 1}. ${response.model} - ${response.responseTime}ms - ${response.tokensUsed} tokens`)
    } catch (error) {
      console.log(`  ${i + 1}. ❌ Error: ${error}`)
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  console.log('')

  // Test 4: Check final model status
  console.log('📊 Final Model Status:')
  const finalStatus = aiModelManager.getModelStatus()
  finalStatus.forEach(model => {
    const statusChange = initialStatus.find(m => m.id === model.id)
    const quotaChange = statusChange ? model.quotaUsed - statusChange.quotaUsed : model.quotaUsed
    console.log(`  ${model.name}: ${model.isAvailable ? '✅' : '❌'} (${model.quotaPercentage.toFixed(1)}% quota used, +${quotaChange} tokens)`)
    if (model.lastError) {
      console.log(`    Last Error: ${model.lastError}`)
    }
  })
  console.log('')

  // Test 5: Test different contexts
  console.log('🎯 Testing Context-Aware Responses:')
  const contexts = [
    { context: 'home', message: 'Who are you?' },
    { context: 'services', message: 'What do you offer?' },
    { context: 'projects', message: 'Show me your work' },
    { context: 'contact', message: 'How can I reach you?' }
  ]

  for (const test of contexts) {
    try {
      const response = await aiModelManager.generateResponse(test.message, test.context)
      console.log(`  ${test.context}: ${response.model} - "${response.content.substring(0, 80)}..."`)
    } catch (error) {
      console.log(`  ${test.context}: ❌ Error: ${error}`)
    }
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  console.log('')

  // Test 6: Performance summary
  console.log('📈 Performance Summary:')
  const performanceData = finalStatus.map(model => ({
    name: model.name,
    available: model.isAvailable,
    quotaUsed: model.quotaUsed,
    quotaPercentage: model.quotaPercentage,
    circuitBreakerState: model.circuitBreakerState
  }))
  
  console.table(performanceData)
  
  console.log('✅ Multi-Model AI System Test Complete!')
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints:')
  
  try {
    // Test AI Assistant API
    console.log('Testing AI Assistant API...')
    const aiResponse = await fetch('http://localhost:3000/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        context: 'home',
        locale: 'en',
        sessionId: `test-${Date.now()}`
      })
    })
    
    if (aiResponse.ok) {
      const data = await aiResponse.json()
      console.log(`✅ AI Assistant: ${data.response ? 'Working' : 'No response'}`)
    } else {
      console.log(`❌ AI Assistant: ${aiResponse.status} ${aiResponse.statusText}`)
    }
  } catch (error) {
    console.log(`❌ AI Assistant API Error: ${error}`)
  }

  try {
    // Test Model Status API
    console.log('Testing Model Status API...')
    const statusResponse = await fetch('http://localhost:3000/api/ai-models/status')
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      console.log(`✅ Model Status: ${statusData.systemStatus} (${statusData.healthPercentage.toFixed(1)}% healthy)`)
      console.log(`   Primary Model: ${statusData.summary.primaryModel}`)
      console.log(`   Available Models: ${statusData.summary.availableModels}/${statusData.summary.totalModels}`)
    } else {
      console.log(`❌ Model Status: ${statusResponse.status} ${statusResponse.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Model Status API Error: ${error}`)
  }

  try {
    // Test Project Estimator API
    console.log('Testing Project Estimator API...')
    const estimatorResponse = await fetch('http://localhost:3000/api/ai-project-estimator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirements: {
          projectType: 'web-application',
          description: 'A simple business website',
          features: ['responsive-design', 'contact-form'],
          timeline: 'flexible'
        },
        locale: 'en'
      })
    })
    
    if (estimatorResponse.ok) {
      const estimateData = await estimatorResponse.json()
      console.log(`✅ Project Estimator: ${estimateData.estimate ? 'Working' : 'No estimate'}`)
      if (estimateData.estimate) {
        const cost = estimateData.estimate.estimatedCost
        console.log(`   Estimated Cost: $${cost.min} - $${cost.max}`)
      }
    } else {
      console.log(`❌ Project Estimator: ${estimatorResponse.status} ${estimatorResponse.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Project Estimator API Error: ${error}`)
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Multi-Model AI System Tests\n')
  console.log('=' .repeat(60))
  
  await testMultiModelSystem()
  await testAPIEndpoints()
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎉 All tests completed!')
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

export { testMultiModelSystem, testAPIEndpoints, runTests }
