// Comprehensive testing script for AI Assistant functionality
import { NextRequest } from 'next/server'

interface TestCase {
  page: string
  context: string
  message: string
  expectedKeywords: string[]
  locale: 'en' | 'fr'
}

const testCases: TestCase[] = [
  // Home page tests
  {
    page: 'home',
    context: 'home',
    message: 'What services do you offer?',
    expectedKeywords: ['web development', 'AI solutions', 'mobile apps', 'consulting'],
    locale: 'en'
  },
  {
    page: 'home',
    context: 'home',
    message: 'Quels services offrez-vous?',
    expectedKeywords: ['développement web', 'solutions IA', 'applications mobiles', 'conseil'],
    locale: 'fr'
  },

  // Services page tests
  {
    page: 'services',
    context: 'services',
    message: 'How much does a web application cost?',
    expectedKeywords: ['pricing', 'cost', 'estimate', 'project', 'budget'],
    locale: 'en'
  },
  {
    page: 'services',
    context: 'services',
    message: 'Combien coûte une application web?',
    expectedKeywords: ['prix', 'coût', 'estimation', 'projet', 'budget'],
    locale: 'fr'
  },

  // Projects page tests
  {
    page: 'projects',
    context: 'projects',
    message: 'Show me your portfolio',
    expectedKeywords: ['portfolio', 'projects', 'examples', 'work', 'technologies'],
    locale: 'en'
  },
  {
    page: 'projects',
    context: 'projects',
    message: 'Montrez-moi votre portfolio',
    expectedKeywords: ['portfolio', 'projets', 'exemples', 'travail', 'technologies'],
    locale: 'fr'
  },

  // Contact page tests
  {
    page: 'contact',
    context: 'contact',
    message: 'How can I get in touch?',
    expectedKeywords: ['contact', 'consultation', 'meeting', 'discuss', 'reach'],
    locale: 'en'
  },
  {
    page: 'contact',
    context: 'contact',
    message: 'Comment puis-je vous contacter?',
    expectedKeywords: ['contact', 'consultation', 'réunion', 'discuter', 'joindre'],
    locale: 'fr'
  },

  // Blog page tests
  {
    page: 'blog',
    context: 'blog',
    message: 'What topics do you write about?',
    expectedKeywords: ['blog', 'articles', 'topics', 'content', 'technology'],
    locale: 'en'
  },
  {
    page: 'blog',
    context: 'blog',
    message: 'Sur quels sujets écrivez-vous?',
    expectedKeywords: ['blog', 'articles', 'sujets', 'contenu', 'technologie'],
    locale: 'fr'
  }
]

export async function testAIAssistantContexts() {
  console.log('🧪 Starting AI Assistant Context Testing...\n')
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.page} (${testCase.locale}) - "${testCase.message}"`)
      
      const response = await fetch('http://localhost:3000/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          context: testCase.context,
          pageContext: testCase.page,
          locale: testCase.locale,
          sessionId: `test-${Date.now()}`,
          conversationHistory: []
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const aiResponse = data.response?.toLowerCase() || ''

      // Check if response contains expected keywords
      const foundKeywords = testCase.expectedKeywords.filter(keyword => 
        aiResponse.includes(keyword.toLowerCase())
      )

      const keywordScore = foundKeywords.length / testCase.expectedKeywords.length
      const passed = keywordScore >= 0.3 // At least 30% of keywords should be present

      if (passed) {
        console.log(`✅ PASSED - Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords`)
        results.passed++
      } else {
        console.log(`❌ FAILED - Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords`)
        console.log(`   Expected: ${testCase.expectedKeywords.join(', ')}`)
        console.log(`   Found: ${foundKeywords.join(', ')}`)
        console.log(`   Response: ${aiResponse.substring(0, 100)}...`)
        results.failed++
        results.errors.push(`${testCase.page} (${testCase.locale}): Low keyword match`)
      }

      // Brief delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`❌ ERROR - ${error}`)
      results.failed++
      results.errors.push(`${testCase.page} (${testCase.locale}): ${error}`)
    }

    console.log('') // Empty line for readability
  }

  // Summary
  console.log('📊 Test Results Summary:')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${((results.passed / testCases.length) * 100).toFixed(1)}%`)

  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:')
    results.errors.forEach(error => console.log(`   - ${error}`))
  }

  return results
}

// Test multilingual functionality
export async function testMultilingualSupport() {
  console.log('🌍 Testing Multilingual Support...\n')

  const multilingualTests = [
    {
      message: 'Hello, can you help me?',
      locale: 'en',
      expectedLanguage: 'english'
    },
    {
      message: 'Bonjour, pouvez-vous m\'aider?',
      locale: 'fr',
      expectedLanguage: 'french'
    },
    {
      message: 'What are your services?',
      locale: 'en',
      expectedLanguage: 'english'
    },
    {
      message: 'Quels sont vos services?',
      locale: 'fr',
      expectedLanguage: 'french'
    }
  ]

  const results = { passed: 0, failed: 0 }

  for (const test of multilingualTests) {
    try {
      const response = await fetch('http://localhost:3000/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          locale: test.locale,
          context: 'home',
          sessionId: `multilingual-test-${Date.now()}`
        })
      })

      const data = await response.json()
      const aiResponse = data.response || ''

      // Simple language detection based on common words
      const isFrench = /\b(je|vous|le|la|les|des|une|un|et|ou|pour|avec|dans|sur|par|de|du|à|au|aux|ce|cette|ces|qui|que|quoi|comment|pourquoi|où|quand)\b/i.test(aiResponse)
      const isEnglish = /\b(the|and|or|for|with|in|on|by|of|to|at|this|that|these|those|who|what|how|why|where|when)\b/i.test(aiResponse)

      const detectedLanguage = isFrench ? 'french' : isEnglish ? 'english' : 'unknown'
      const passed = detectedLanguage === test.expectedLanguage

      console.log(`${test.locale.toUpperCase()}: "${test.message}"`)
      console.log(`Expected: ${test.expectedLanguage}, Detected: ${detectedLanguage}`)
      console.log(`${passed ? '✅ PASSED' : '❌ FAILED'}`)
      console.log(`Response: ${aiResponse.substring(0, 100)}...\n`)

      if (passed) results.passed++
      else results.failed++

      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`❌ ERROR: ${error}\n`)
      results.failed++
    }
  }

  console.log(`Multilingual Test Results: ${results.passed}/${multilingualTests.length} passed`)
  return results
}

// Test performance
export async function testPerformance() {
  console.log('⚡ Testing AI Assistant Performance...\n')

  const performanceTests = [
    { message: 'Quick test', expectedMaxTime: 5000 },
    { message: 'Tell me about your services in detail', expectedMaxTime: 8000 },
    { message: 'I need a complex web application with AI features', expectedMaxTime: 10000 }
  ]

  const results = { passed: 0, failed: 0, times: [] as number[] }

  for (const test of performanceTests) {
    try {
      const startTime = Date.now()
      
      const response = await fetch('http://localhost:3000/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          context: 'services',
          locale: 'en',
          sessionId: `perf-test-${Date.now()}`
        })
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime
      results.times.push(responseTime)

      const passed = responseTime <= test.expectedMaxTime
      console.log(`"${test.message}"`)
      console.log(`Response time: ${responseTime}ms (max: ${test.expectedMaxTime}ms)`)
      console.log(`${passed ? '✅ PASSED' : '❌ FAILED'}\n`)

      if (passed) results.passed++
      else results.failed++

      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.log(`❌ ERROR: ${error}\n`)
      results.failed++
    }
  }

  const avgTime = results.times.reduce((a, b) => a + b, 0) / results.times.length
  console.log(`Performance Results: ${results.passed}/${performanceTests.length} passed`)
  console.log(`Average response time: ${avgTime.toFixed(0)}ms`)
  
  return results
}

// Main test runner
export async function runAllTests() {
  console.log('🚀 Starting Comprehensive AI Assistant Testing\n')
  console.log('=' .repeat(60))
  
  const contextResults = await testAIAssistantContexts()
  console.log('\n' + '=' .repeat(60))
  
  const multilingualResults = await testMultilingualSupport()
  console.log('\n' + '=' .repeat(60))
  
  const performanceResults = await testPerformance()
  console.log('\n' + '=' .repeat(60))

  // Overall summary
  const totalTests = testCases.length + 4 + 3 // context + multilingual + performance
  const totalPassed = contextResults.passed + multilingualResults.passed + performanceResults.passed
  const overallSuccessRate = (totalPassed / totalTests) * 100

  console.log('\n🎯 OVERALL TEST SUMMARY:')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${totalPassed}`)
  console.log(`Failed: ${totalTests - totalPassed}`)
  console.log(`Success Rate: ${overallSuccessRate.toFixed(1)}%`)
  
  if (overallSuccessRate >= 80) {
    console.log('🎉 AI Assistant is performing well!')
  } else {
    console.log('⚠️  AI Assistant needs improvement')
  }

  return {
    context: contextResults,
    multilingual: multilingualResults,
    performance: performanceResults,
    overall: { passed: totalPassed, total: totalTests, successRate: overallSuccessRate }
  }
}

// Export for use in other scripts
if (require.main === module) {
  runAllTests().catch(console.error)
}
