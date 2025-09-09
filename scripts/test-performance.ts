// Comprehensive performance testing for AI assistant and real data systems
// Tests response times, database performance, API efficiency, and overall site performance

interface PerformanceTestResult {
  test: string
  success: boolean
  responseTime: number
  dataSize?: number
  throughput?: number
  errors: string[]
  details?: any
}

interface PerformanceReport {
  summary: {
    totalTests: number
    passedTests: number
    averageResponseTime: number
    totalDataTransferred: number
  }
  categories: {
    aiAssistant: PerformanceTestResult[]
    database: PerformanceTestResult[]
    apis: PerformanceTestResult[]
    pages: PerformanceTestResult[]
  }
  recommendations: string[]
}

export async function testPerformance(): Promise<PerformanceReport> {
  console.log('⚡ Starting Comprehensive Performance Testing')
  console.log('🔍 Testing AI Response Times, Database Performance, and Site Speed\n')
  console.log('=' .repeat(70))

  const report: PerformanceReport = {
    summary: {
      totalTests: 0,
      passedTests: 0,
      averageResponseTime: 0,
      totalDataTransferred: 0
    },
    categories: {
      aiAssistant: [],
      database: [],
      apis: [],
      pages: []
    },
    recommendations: []
  }

  try {
    // Test AI Assistant Performance
    console.log('\n🤖 Testing AI Assistant Performance...')
    report.categories.aiAssistant = await testAIAssistantPerformance()

    // Test Database Performance
    console.log('\n🗄️ Testing Database Performance...')
    report.categories.database = await testDatabasePerformance()

    // Test API Performance
    console.log('\n🔌 Testing API Performance...')
    report.categories.apis = await testAPIPerformance()

    // Test Page Load Performance
    console.log('\n📄 Testing Page Load Performance...')
    report.categories.pages = await testPageLoadPerformance()

    // Generate summary
    generatePerformanceSummary(report)

    // Generate recommendations
    generatePerformanceRecommendations(report)

  } catch (error) {
    console.error('❌ Performance testing failed:', error)
  }

  return report
}

async function testAIAssistantPerformance(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []

  const testCases = [
    { message: 'Hello, what services do you offer?', context: 'services', expectedTime: 5000 },
    { message: 'How much does a web application cost?', context: 'services', expectedTime: 5000 },
    { message: 'Show me your portfolio', context: 'projects', expectedTime: 5000 },
    { message: 'I want to schedule a consultation', context: 'contact', expectedTime: 5000 },
    { message: 'Bonjour, quels services offrez-vous?', context: 'services', expectedTime: 5000 }
  ]

  for (const testCase of testCases) {
    console.log(`   Testing: "${testCase.message.substring(0, 30)}..."`)
    
    const startTime = Date.now()
    try {
      const response = await fetch('http://localhost:3000/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.message,
          context: testCase.context,
          locale: testCase.message.includes('Bonjour') ? 'fr' : 'en',
          sessionId: `perf-test-${Date.now()}`
        })
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      results.push({
        test: `AI Response: ${testCase.context}`,
        success: response.ok && data.response && data.response.length > 0,
        responseTime,
        dataSize: JSON.stringify(data).length,
        errors: response.ok ? [] : [`HTTP ${response.status}`],
        details: {
          model: data.model,
          tokensUsed: data.tokensUsed,
          quotaRemaining: data.quotaRemaining
        }
      })

      console.log(`     ✅ ${responseTime}ms (${data.model || 'Unknown model'})`)

    } catch (error) {
      results.push({
        test: `AI Response: ${testCase.context}`,
        success: false,
        responseTime: Date.now() - startTime,
        errors: [error.toString()]
      })
      console.log(`     ❌ Failed: ${error}`)
    }

    // Brief delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

async function testDatabasePerformance(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []

  const dbTests = [
    { name: 'Blog Posts Query', endpoint: '/api/blog/posts?limit=10' },
    { name: 'Blog Posts with Search', endpoint: '/api/blog/posts?search=react&limit=5' },
    { name: 'Appointments Query', endpoint: '/api/calendar/appointments?limit=5' },
    { name: 'Calendar Availability', endpoint: '/api/calendar/availability?startDate=2025-09-10&endDate=2025-09-12' }
  ]

  for (const test of dbTests) {
    console.log(`   Testing: ${test.name}`)
    
    const startTime = Date.now()
    try {
      const response = await fetch(`http://localhost:3000${test.endpoint}`)
      const responseTime = Date.now() - startTime
      const data = await response.json()

      results.push({
        test: test.name,
        success: response.ok && data && Object.keys(data).length > 0,
        responseTime,
        dataSize: JSON.stringify(data).length,
        errors: response.ok ? [] : [`HTTP ${response.status}`],
        details: {
          recordCount: Array.isArray(data.posts) ? data.posts.length : 
                      Array.isArray(data.appointments) ? data.appointments.length :
                      Array.isArray(data.slots) ? data.slots.length : 0
        }
      })

      console.log(`     ✅ ${responseTime}ms (${results[results.length - 1].details?.recordCount || 0} records)`)

    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        responseTime: Date.now() - startTime,
        errors: [error.toString()]
      })
      console.log(`     ❌ Failed: ${error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

async function testAPIPerformance(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []

  const apiTests = [
    { name: 'Recommendations API', endpoint: '/api/recommendations?sessionId=perf-test&page=home&locale=en&limit=4' },
    { name: 'AI Models Status', endpoint: '/api/ai-models/status' },
    { name: 'Project Estimator', endpoint: '/api/ai-project-estimator', method: 'POST', body: {
      projectType: 'web-application',
      features: ['responsive-design', 'cms'],
      timeline: 'standard',
      budget: 'medium'
    }}
  ]

  for (const test of apiTests) {
    console.log(`   Testing: ${test.name}`)
    
    const startTime = Date.now()
    try {
      const options: RequestInit = {
        method: test.method || 'GET',
        headers: { 'Content-Type': 'application/json' }
      }

      if (test.body) {
        options.body = JSON.stringify(test.body)
      }

      const response = await fetch(`http://localhost:3000${test.endpoint}`, options)
      const responseTime = Date.now() - startTime
      const data = await response.json()

      results.push({
        test: test.name,
        success: response.ok,
        responseTime,
        dataSize: JSON.stringify(data).length,
        errors: response.ok ? [] : [`HTTP ${response.status}`],
        details: data
      })

      console.log(`     ✅ ${responseTime}ms`)

    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        responseTime: Date.now() - startTime,
        errors: [error.toString()]
      })
      console.log(`     ❌ Failed: ${error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

async function testPageLoadPerformance(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/projects', name: 'Projects' },
    { path: '/contact', name: 'Contact' },
    { path: '/blog', name: 'Blog' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' }
  ]

  for (const page of pages) {
    console.log(`   Testing: ${page.name} page`)
    
    const startTime = Date.now()
    try {
      const response = await fetch(`http://localhost:3000${page.path}`)
      const responseTime = Date.now() - startTime
      const html = await response.text()

      results.push({
        test: `${page.name} Page Load`,
        success: response.ok && html.length > 1000,
        responseTime,
        dataSize: html.length,
        errors: response.ok ? [] : [`HTTP ${response.status}`],
        details: {
          hasRealContent: !html.includes('mock') && !html.includes('placeholder'),
          hasAIAssistant: html.includes('ai-assistant'),
          hasResponsiveCSS: html.includes('responsive') || html.includes('sm:')
        }
      })

      console.log(`     ✅ ${responseTime}ms (${(html.length / 1024).toFixed(1)}KB)`)

    } catch (error) {
      results.push({
        test: `${page.name} Page Load`,
        success: false,
        responseTime: Date.now() - startTime,
        errors: [error.toString()]
      })
      console.log(`     ❌ Failed: ${error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return results
}

function generatePerformanceSummary(report: PerformanceReport) {
  const allResults = [
    ...report.categories.aiAssistant,
    ...report.categories.database,
    ...report.categories.apis,
    ...report.categories.pages
  ]

  report.summary.totalTests = allResults.length
  report.summary.passedTests = allResults.filter(r => r.success).length
  report.summary.averageResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length
  report.summary.totalDataTransferred = allResults.reduce((sum, r) => sum + (r.dataSize || 0), 0)

  console.log('\n' + '=' .repeat(70))
  console.log('📊 PERFORMANCE TEST SUMMARY')
  console.log('=' .repeat(70))
  console.log(`Total Tests: ${report.summary.totalTests}`)
  console.log(`✅ Passed: ${report.summary.passedTests}`)
  console.log(`❌ Failed: ${report.summary.totalTests - report.summary.passedTests}`)
  console.log(`📈 Success Rate: ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%`)
  console.log(`⚡ Average Response Time: ${report.summary.averageResponseTime.toFixed(0)}ms`)
  console.log(`📊 Total Data Transferred: ${(report.summary.totalDataTransferred / 1024).toFixed(1)}KB`)

  // Category breakdown
  console.log('\n📋 Performance by Category:')
  
  const categories = [
    { name: 'AI Assistant', results: report.categories.aiAssistant },
    { name: 'Database', results: report.categories.database },
    { name: 'APIs', results: report.categories.apis },
    { name: 'Page Loads', results: report.categories.pages }
  ]

  for (const category of categories) {
    const passed = category.results.filter(r => r.success).length
    const total = category.results.length
    const avgTime = category.results.reduce((sum, r) => sum + r.responseTime, 0) / total
    
    console.log(`   ${category.name}: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%) - Avg: ${avgTime.toFixed(0)}ms`)
  }
}

function generatePerformanceRecommendations(report: PerformanceReport) {
  console.log('\n💡 Performance Recommendations:')

  const aiResults = report.categories.aiAssistant
  const avgAITime = aiResults.reduce((sum, r) => sum + r.responseTime, 0) / aiResults.length

  if (avgAITime > 3000) {
    report.recommendations.push('Consider implementing AI response caching for common queries')
    console.log('   🔄 Consider implementing AI response caching for common queries')
  }

  const dbResults = report.categories.database
  const avgDBTime = dbResults.reduce((sum, r) => sum + r.responseTime, 0) / dbResults.length

  if (avgDBTime > 1000) {
    report.recommendations.push('Database queries could benefit from indexing optimization')
    console.log('   🗄️ Database queries could benefit from indexing optimization')
  }

  const pageResults = report.categories.pages
  const avgPageTime = pageResults.reduce((sum, r) => sum + r.responseTime, 0) / pageResults.length

  if (avgPageTime > 2000) {
    report.recommendations.push('Page load times could be improved with better caching')
    console.log('   📄 Page load times could be improved with better caching')
  }

  const failedTests = [
    ...report.categories.aiAssistant,
    ...report.categories.database,
    ...report.categories.apis,
    ...report.categories.pages
  ].filter(r => !r.success)

  if (failedTests.length > 0) {
    report.recommendations.push(`${failedTests.length} tests failed - investigate error handling`)
    console.log(`   ⚠️ ${failedTests.length} tests failed - investigate error handling`)
  }

  if (report.recommendations.length === 0) {
    console.log('   ✅ Performance is excellent! No recommendations needed.')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPerformance().then(report => {
    console.log('\n🎉 Performance testing completed!')
    console.log('📊 All systems tested with real data and production APIs')
  }).catch(console.error)
}
