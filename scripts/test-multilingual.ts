// Comprehensive multilingual testing for AI assistant across all pages
import { NextRequest } from 'next/server'

interface MultilingualTestCase {
  page: string
  context: string
  tests: {
    en: { message: string; expectedKeywords: string[] }
    fr: { message: string; expectedKeywords: string[] }
  }
}

const multilingualTestCases: MultilingualTestCase[] = [
  {
    page: 'home',
    context: 'home',
    tests: {
      en: {
        message: 'Hello, what services do you offer?',
        expectedKeywords: ['services', 'web development', 'ai', 'mobile', 'consulting']
      },
      fr: {
        message: 'Bonjour, quels services offrez-vous?',
        expectedKeywords: ['services', 'développement web', 'ia', 'mobile', 'conseil']
      }
    }
  },
  {
    page: 'services',
    context: 'services',
    tests: {
      en: {
        message: 'How much does a web application cost?',
        expectedKeywords: ['cost', 'price', 'estimate', 'web application', 'budget']
      },
      fr: {
        message: 'Combien coûte une application web?',
        expectedKeywords: ['coût', 'prix', 'estimation', 'application web', 'budget']
      }
    }
  },
  {
    page: 'projects',
    context: 'projects',
    tests: {
      en: {
        message: 'Show me your portfolio and previous work',
        expectedKeywords: ['portfolio', 'projects', 'work', 'examples', 'experience']
      },
      fr: {
        message: 'Montrez-moi votre portfolio et vos travaux précédents',
        expectedKeywords: ['portfolio', 'projets', 'travail', 'exemples', 'expérience']
      }
    }
  },
  {
    page: 'contact',
    context: 'contact',
    tests: {
      en: {
        message: 'I want to schedule a consultation',
        expectedKeywords: ['consultation', 'schedule', 'appointment', 'meeting', 'contact']
      },
      fr: {
        message: 'Je veux planifier une consultation',
        expectedKeywords: ['consultation', 'planifier', 'rendez-vous', 'réunion', 'contact']
      }
    }
  },
  {
    page: 'blog',
    context: 'blog',
    tests: {
      en: {
        message: 'What topics do you write about?',
        expectedKeywords: ['blog', 'articles', 'topics', 'content', 'technology']
      },
      fr: {
        message: 'Sur quels sujets écrivez-vous?',
        expectedKeywords: ['blog', 'articles', 'sujets', 'contenu', 'technologie']
      }
    }
  },
  {
    page: 'privacy',
    context: 'privacy',
    tests: {
      en: {
        message: 'How do you handle my personal data?',
        expectedKeywords: ['privacy', 'data', 'personal', 'protection', 'policy']
      },
      fr: {
        message: 'Comment gérez-vous mes données personnelles?',
        expectedKeywords: ['confidentialité', 'données', 'personnelles', 'protection', 'politique']
      }
    }
  },
  {
    page: 'terms',
    context: 'terms',
    tests: {
      en: {
        message: 'What are your terms of service?',
        expectedKeywords: ['terms', 'service', 'conditions', 'agreement', 'legal']
      },
      fr: {
        message: 'Quelles sont vos conditions de service?',
        expectedKeywords: ['conditions', 'service', 'accord', 'légal', 'termes']
      }
    }
  }
]

export async function testMultilingualFunctionality() {
  console.log('🌍 Starting Comprehensive Multilingual Testing\n')
  console.log('=' .repeat(70))
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [] as string[]
  }

  for (const testCase of multilingualTestCases) {
    console.log(`\n📄 Testing Page: ${testCase.page.toUpperCase()}`)
    console.log('-' .repeat(50))

    // Test English
    console.log('\n🇺🇸 English Test:')
    const enResult = await testLanguage(
      testCase.page,
      testCase.context,
      testCase.tests.en.message,
      testCase.tests.en.expectedKeywords,
      'en'
    )
    results.totalTests++
    if (enResult.passed) {
      results.passedTests++
      console.log('✅ PASSED')
    } else {
      results.failedTests++
      console.log('❌ FAILED')
      results.errors.push(`${testCase.page} (EN): ${enResult.error}`)
    }
    console.log(`   Response: "${enResult.response.substring(0, 100)}..."`)
    console.log(`   Keywords found: ${enResult.foundKeywords.join(', ')}`)

    // Brief delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test French
    console.log('\n🇫🇷 French Test:')
    const frResult = await testLanguage(
      testCase.page,
      testCase.context,
      testCase.tests.fr.message,
      testCase.tests.fr.expectedKeywords,
      'fr'
    )
    results.totalTests++
    if (frResult.passed) {
      results.passedTests++
      console.log('✅ PASSED')
    } else {
      results.failedTests++
      console.log('❌ FAILED')
      results.errors.push(`${testCase.page} (FR): ${frResult.error}`)
    }
    console.log(`   Response: "${frResult.response.substring(0, 100)}..."`)
    console.log(`   Keywords found: ${frResult.foundKeywords.join(', ')}`)

    // Brief delay between test cases
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Summary
  console.log('\n' + '=' .repeat(70))
  console.log('📊 MULTILINGUAL TEST SUMMARY')
  console.log('=' .repeat(70))
  console.log(`Total Tests: ${results.totalTests}`)
  console.log(`✅ Passed: ${results.passedTests}`)
  console.log(`❌ Failed: ${results.failedTests}`)
  console.log(`📈 Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`)

  if (results.errors.length > 0) {
    console.log('\n🚨 Failed Tests:')
    results.errors.forEach(error => console.log(`   - ${error}`))
  }

  // Language-specific analysis
  const enTests = results.totalTests / 2
  const frTests = results.totalTests / 2
  const enPassed = results.errors.filter(e => e.includes('(EN)')).length
  const frPassed = results.errors.filter(e => e.includes('(FR)')).length

  console.log('\n📊 Language-Specific Results:')
  console.log(`🇺🇸 English: ${enTests - enPassed}/${enTests} passed (${(((enTests - enPassed) / enTests) * 100).toFixed(1)}%)`)
  console.log(`🇫🇷 French: ${frTests - frPassed}/${frTests} passed (${(((frTests - frPassed) / frTests) * 100).toFixed(1)}%)`)

  return results
}

async function testLanguage(
  page: string,
  context: string,
  message: string,
  expectedKeywords: string[],
  locale: 'en' | 'fr'
): Promise<{
  passed: boolean
  error?: string
  response: string
  foundKeywords: string[]
}> {
  try {
    const response = await fetch('http://localhost:3000/api/ai-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        pageContext: page,
        locale,
        sessionId: `multilingual-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationHistory: []
      })
    })

    if (!response.ok) {
      return {
        passed: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        response: '',
        foundKeywords: []
      }
    }

    const data = await response.json()
    const aiResponse = data.response?.toLowerCase() || ''

    // Check for expected keywords
    const foundKeywords = expectedKeywords.filter(keyword => 
      aiResponse.includes(keyword.toLowerCase())
    )

    // Language detection
    const isFrench = /\b(je|vous|le|la|les|des|une|un|et|ou|pour|avec|dans|sur|par|de|du|à|au|aux|ce|cette|ces|qui|que|quoi|comment|pourquoi|où|quand|bonjour|merci|oui|non)\b/i.test(aiResponse)
    const isEnglish = /\b(the|and|or|for|with|in|on|by|of|to|at|this|that|these|those|who|what|how|why|where|when|hello|thank|yes|no)\b/i.test(aiResponse)

    let languageScore = 0
    if (locale === 'fr' && isFrench) languageScore += 2
    if (locale === 'en' && isEnglish) languageScore += 2
    if (locale === 'fr' && !isEnglish) languageScore += 1
    if (locale === 'en' && !isFrench) languageScore += 1

    // Scoring criteria
    const keywordScore = foundKeywords.length / expectedKeywords.length
    const passed = keywordScore >= 0.3 && languageScore >= 2 // At least 30% keywords and correct language

    return {
      passed,
      error: passed ? undefined : `Low keyword match (${foundKeywords.length}/${expectedKeywords.length}) or wrong language`,
      response: data.response || '',
      foundKeywords
    }

  } catch (error) {
    return {
      passed: false,
      error: `Request failed: ${error}`,
      response: '',
      foundKeywords: []
    }
  }
}

// Test specific multilingual features
export async function testSpecificMultilingualFeatures() {
  console.log('\n🔍 Testing Specific Multilingual Features\n')

  const specificTests = [
    {
      name: 'Language Auto-Detection',
      tests: [
        { message: 'Hello, I need help', expectedLang: 'en' },
        { message: 'Bonjour, j\'ai besoin d\'aide', expectedLang: 'fr' },
        { message: 'Hi there!', expectedLang: 'en' },
        { message: 'Salut!', expectedLang: 'fr' }
      ]
    },
    {
      name: 'Mixed Language Handling',
      tests: [
        { message: 'Hello, je veux un website', expectedLang: 'mixed' },
        { message: 'Bonjour, I need a site web', expectedLang: 'mixed' }
      ]
    },
    {
      name: 'Technical Terms Translation',
      tests: [
        { message: 'I need web development services', expectedTerms: ['web development'] },
        { message: 'J\'ai besoin de services de développement web', expectedTerms: ['développement web'] }
      ]
    }
  ]

  for (const testGroup of specificTests) {
    console.log(`\n📋 ${testGroup.name}:`)
    
    for (const test of testGroup.tests) {
      try {
        const response = await fetch('http://localhost:3000/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: test.message,
            context: 'services',
            locale: 'auto', // Let AI detect
            sessionId: `specific-test-${Date.now()}`
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ "${test.message}" → Response received`)
          console.log(`      Response: "${data.response.substring(0, 80)}..."`)
        } else {
          console.log(`   ❌ "${test.message}" → HTTP ${response.status}`)
        }
      } catch (error) {
        console.log(`   ❌ "${test.message}" → Error: ${error}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// Test recommendations in different languages
export async function testMultilingualRecommendations() {
  console.log('\n🎯 Testing Multilingual Recommendations\n')

  const sessionId = `multilingual-rec-${Date.now()}`

  // Track behavior in English
  console.log('📝 Tracking English behavior...')
  await fetch('http://localhost:3000/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      action: { type: 'search', query: 'web development', page: 'services' }
    })
  })

  // Get English recommendations
  const enResponse = await fetch(`http://localhost:3000/api/recommendations?sessionId=${sessionId}&page=services&locale=en&limit=3`)
  if (enResponse.ok) {
    const enData = await enResponse.json()
    console.log(`✅ English recommendations: ${enData.recommendations.length} items`)
    enData.recommendations.forEach((rec: any, i: number) => {
      console.log(`   ${i + 1}. ${rec.title} (${rec.reason})`)
    })
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Get French recommendations
  const frResponse = await fetch(`http://localhost:3000/api/recommendations?sessionId=${sessionId}&page=services&locale=fr&limit=3`)
  if (frResponse.ok) {
    const frData = await frResponse.json()
    console.log(`✅ French recommendations: ${frData.recommendations.length} items`)
    frData.recommendations.forEach((rec: any, i: number) => {
      console.log(`   ${i + 1}. ${rec.title} (${rec.reason})`)
    })
  }
}

// Test appointment scheduling in different languages
export async function testMultilingualAppointments() {
  console.log('\n📅 Testing Multilingual Appointment Scheduling\n')

  // Test availability API
  console.log('📋 Testing availability API...')
  const availResponse = await fetch('http://localhost:3000/api/calendar/availability?startDate=2025-09-09&endDate=2025-09-09')
  if (availResponse.ok) {
    const availData = await availResponse.json()
    console.log(`✅ Availability API: ${availData.slots.length} slots available`)
  }

  // Test French appointment booking
  console.log('🇫🇷 Testing French appointment booking...')
  const frBookingResponse = await fetch('http://localhost:3000/api/calendar/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: 'Marie Dubois',
      clientEmail: 'marie@example.fr',
      clientPhone: '+33 1 23 45 67 89',
      company: 'Entreprise Test',
      projectType: 'web-development',
      description: 'J\'ai besoin d\'un site web pour mon entreprise',
      date: '2025-09-09',
      time: '14:30',
      meetingType: 'VIDEO',
      preferredLanguage: 'fr'
    })
  })

  if (frBookingResponse.ok) {
    const frBookingData = await frBookingResponse.json()
    console.log(`✅ French appointment booked: ${frBookingData.appointmentId}`)
    console.log(`   Message: ${frBookingData.message}`)
  } else {
    console.log(`❌ French appointment booking failed: ${frBookingResponse.status}`)
  }
}

// Main test runner
export async function runMultilingualTests() {
  console.log('🚀 Starting Comprehensive Multilingual Testing Suite\n')
  console.log('Testing AI Assistant, Recommendations, and Appointments in EN/FR\n')

  try {
    // Main multilingual functionality test
    const mainResults = await testMultilingualFunctionality()
    
    // Specific feature tests
    await testSpecificMultilingualFeatures()
    
    // Recommendations test
    await testMultilingualRecommendations()
    
    // Appointments test
    await testMultilingualAppointments()

    console.log('\n🎉 All multilingual tests completed!')
    return mainResults

  } catch (error) {
    console.error('❌ Test suite failed:', error)
    return null
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runMultilingualTests().catch(console.error)
}
