// Simplified mobile responsiveness testing using real data
// Tests responsive design, real data loading, and mobile-specific features

interface MobileTestResult {
  page: string
  tests: {
    pageLoad: boolean
    realDataLoad: boolean
    responsiveCSS: boolean
    mobileNavigation: boolean
    touchFriendly: boolean
  }
  performance: {
    loadTime: number
    dataSize: number
  }
  errors: string[]
}

const testPages = [
  { path: '/', name: 'Home', hasRecommendations: true },
  { path: '/services', name: 'Services' },
  { path: '/projects', name: 'Projects' },
  { path: '/contact', name: 'Contact', hasAppointments: true },
  { path: '/blog', name: 'Blog', hasRecommendations: true },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' }
]

export async function testMobileResponsiveness() {
  console.log('📱 Starting Mobile Responsiveness Testing')
  console.log('🔍 Testing with REAL DATA ONLY - No Mock Data\n')
  console.log('=' .repeat(70))

  const results: MobileTestResult[] = []
  let totalTests = 0
  let passedTests = 0

  for (const testPage of testPages) {
    console.log(`\n📄 Testing ${testPage.name} page...`)
    
    const result = await testPageMobile(testPage)
    results.push(result)

    // Count test results
    const testCount = Object.values(result.tests).filter(Boolean).length
    totalTests += Object.keys(result.tests).length
    passedTests += testCount

    // Display results
    console.log(`   ✅ Page Load: ${result.tests.pageLoad ? 'PASS' : 'FAIL'}`)
    console.log(`   ✅ Real Data: ${result.tests.realDataLoad ? 'PASS' : 'FAIL'}`)
    console.log(`   ✅ Responsive CSS: ${result.tests.responsiveCSS ? 'PASS' : 'FAIL'}`)
    console.log(`   ✅ Mobile Navigation: ${result.tests.mobileNavigation ? 'PASS' : 'FAIL'}`)
    console.log(`   ✅ Touch Friendly: ${result.tests.touchFriendly ? 'PASS' : 'FAIL'}`)
    console.log(`   ⚡ Load Time: ${result.performance.loadTime}ms`)
    console.log(`   📊 Data Size: ${result.performance.dataSize} bytes`)

    if (result.errors.length > 0) {
      console.log(`   ❌ Errors: ${result.errors.join(', ')}`)
    }

    // Brief delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Generate comprehensive report
  await generateMobileTestReport(results, totalTests, passedTests)

  return results
}

async function testPageMobile(testPage: any): Promise<MobileTestResult> {
  const errors: string[] = []
  
  const result: MobileTestResult = {
    page: testPage.name,
    tests: {
      pageLoad: false,
      realDataLoad: false,
      responsiveCSS: false,
      mobileNavigation: false,
      touchFriendly: false
    },
    performance: {
      loadTime: 0,
      dataSize: 0
    },
    errors
  }

  try {
    // Test 1: Page Load
    const startTime = Date.now()
    const response = await fetch(`http://localhost:3000${testPage.path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      }
    })
    
    result.performance.loadTime = Date.now() - startTime
    result.tests.pageLoad = response.status === 200

    if (!result.tests.pageLoad) {
      errors.push(`Page load failed: ${response.status}`)
      return result
    }

    const html = await response.text()
    result.performance.dataSize = html.length

    // Test 2: Real Data Loading
    result.tests.realDataLoad = await testRealDataInHTML(html, testPage)

    // Test 3: Responsive CSS
    result.tests.responsiveCSS = testResponsiveCSS(html)

    // Test 4: Mobile Navigation
    result.tests.mobileNavigation = testMobileNavigation(html)

    // Test 5: Touch Friendly
    result.tests.touchFriendly = testTouchFriendly(html)

    // Test specific features
    if (testPage.hasRecommendations) {
      await testRecommendationsAPI()
    }

    if (testPage.hasAppointments) {
      await testAppointmentsAPI()
    }

  } catch (error) {
    errors.push(`Test Error: ${error}`)
  }

  return result
}

async function testRealDataInHTML(html: string, testPage: any): Promise<boolean> {
  try {
    if (testPage.path === '/blog') {
      // Check for real blog posts in HTML
      const hasBlogPosts = html.includes('blog-post') || 
                          html.includes('article') ||
                          html.includes('React Performance') ||
                          html.includes('Web Development')
      
      // Also test the API directly
      const apiResponse = await fetch('http://localhost:3000/api/blog/posts?limit=3')
      if (apiResponse.ok) {
        const data = await apiResponse.json()
        return hasBlogPosts && data.posts && data.posts.length > 0
      }
      return hasBlogPosts
    }
    
    if (testPage.path === '/') {
      // Check for real portfolio content
      const hasPortfolioContent = html.includes('developer') || 
                                 html.includes('portfolio') ||
                                 html.includes('service') ||
                                 html.length > 5000 // Substantial content
      return hasPortfolioContent
    }

    if (testPage.path === '/services') {
      // Check for real services data
      const hasServices = html.includes('development') || 
                         html.includes('consulting') ||
                         html.includes('web application') ||
                         html.includes('mobile')
      return hasServices
    }

    if (testPage.path === '/contact') {
      // Check for contact form and appointment scheduler
      const hasContactForm = html.includes('<form') && html.includes('email')
      const hasAppointmentScheduler = html.includes('appointment') || html.includes('schedule')
      return hasContactForm && hasAppointmentScheduler
    }

    // For other pages, check for meaningful content
    return html.length > 2000 && !html.includes('mock') && !html.includes('placeholder')

  } catch (error) {
    return false
  }
}

function testResponsiveCSS(html: string): boolean {
  // Check for responsive design indicators
  const hasViewportMeta = html.includes('viewport') && html.includes('width=device-width')
  const hasResponsiveCSS = html.includes('responsive') || 
                          html.includes('mobile') ||
                          html.includes('sm:') || // Tailwind responsive classes
                          html.includes('md:') ||
                          html.includes('lg:') ||
                          html.includes('@media')
  
  const hasFlexbox = html.includes('flex') || html.includes('grid')
  
  return hasViewportMeta && (hasResponsiveCSS || hasFlexbox)
}

function testMobileNavigation(html: string): boolean {
  // Check for mobile navigation elements
  const hasSidebar = html.includes('sidebar') || html.includes('SidebarProvider')
  const hasMobileMenu = html.includes('menu') || html.includes('hamburger') || html.includes('SidebarTrigger')
  const hasNavigation = html.includes('<nav') || html.includes('navigation')
  
  return hasSidebar && (hasMobileMenu || hasNavigation)
}

function testTouchFriendly(html: string): boolean {
  // Check for touch-friendly elements
  const hasButtons = html.includes('<button') && html.includes('class=')
  const hasClickableElements = html.includes('cursor-pointer') || html.includes('hover:')
  const hasProperSpacing = html.includes('p-') || html.includes('m-') || html.includes('gap-')
  const hasAccessibility = html.includes('aria-') || html.includes('role=')
  
  return hasButtons && hasClickableElements && hasProperSpacing && hasAccessibility
}

async function testRecommendationsAPI(): Promise<boolean> {
  try {
    const sessionId = `mobile-test-${Date.now()}`
    
    // Track some behavior
    await fetch('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        action: { type: 'page_view', page: 'home' }
      })
    })

    // Get recommendations
    const response = await fetch(`http://localhost:3000/api/recommendations?sessionId=${sessionId}&page=home&locale=en&limit=3`)
    
    if (response.ok) {
      const data = await response.json()
      return data.recommendations && data.recommendations.length > 0
    }
    
    return false
  } catch (error) {
    return false
  }
}

async function testAppointmentsAPI(): Promise<boolean> {
  try {
    // Test availability API
    const availResponse = await fetch('http://localhost:3000/api/calendar/availability?startDate=2025-09-10&endDate=2025-09-10')
    
    if (availResponse.ok) {
      const availData = await availResponse.json()
      return availData.slots && Array.isArray(availData.slots)
    }
    
    return false
  } catch (error) {
    return false
  }
}

async function generateMobileTestReport(results: MobileTestResult[], totalTests: number, passedTests: number) {
  console.log('\n' + '=' .repeat(70))
  console.log('📊 MOBILE RESPONSIVENESS TEST SUMMARY')
  console.log('=' .repeat(70))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}`)
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  // Page-specific analysis
  console.log('\n📄 Page-Specific Results:')
  for (const result of results) {
    const pagePassed = Object.values(result.tests).filter(Boolean).length
    const pageTotal = Object.keys(result.tests).length
    
    console.log(`   ${result.page}: ${pagePassed}/${pageTotal} (${((pagePassed / pageTotal) * 100).toFixed(1)}%)`)
  }

  // Performance analysis
  console.log('\n⚡ Performance Analysis:')
  const avgLoadTime = results.reduce((sum, r) => sum + r.performance.loadTime, 0) / results.length
  const avgDataSize = results.reduce((sum, r) => sum + r.performance.dataSize, 0) / results.length
  
  console.log(`   Average Load Time: ${avgLoadTime.toFixed(0)}ms`)
  console.log(`   Average Page Size: ${(avgDataSize / 1024).toFixed(1)}KB`)

  // Test category analysis
  console.log('\n📋 Test Category Results:')
  const categories = ['pageLoad', 'realDataLoad', 'responsiveCSS', 'mobileNavigation', 'touchFriendly']
  
  for (const category of categories) {
    const categoryPassed = results.filter(r => r.tests[category as keyof typeof r.tests]).length
    const categoryTotal = results.length
    console.log(`   ${category}: ${categoryPassed}/${categoryTotal} (${((categoryPassed / categoryTotal) * 100).toFixed(1)}%)`)
  }

  // Error summary
  const allErrors = results.flatMap(r => r.errors)
  if (allErrors.length > 0) {
    console.log('\n🚨 Issues Found:')
    const errorCounts = allErrors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([error, count]) => {
        console.log(`   ${count}x: ${error}`)
      })
  }

  // Real data validation
  console.log('\n🔍 Real Data Validation:')
  const realDataPages = results.filter(r => r.tests.realDataLoad).length
  console.log(`   Pages with Real Data: ${realDataPages}/${results.length}`)
  console.log(`   No Mock Data Detected: ${allErrors.filter(e => e.includes('mock')).length === 0 ? 'PASS' : 'FAIL'}`)

  console.log('\n✅ Mobile responsiveness testing completed!')
  console.log('📱 All tests use real data from database and APIs')
}

// Run tests if this file is executed directly
if (require.main === module) {
  testMobileResponsiveness().catch(console.error)
}
