// Simple test to check for console errors and UI functionality
const puppeteer = require('puppeteer');

async function testUIConsole() {
  console.log('🔍 Testing AI Assistant UI for console errors...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Navigate to the page
    console.log('📄 Loading home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    // Check if AI assistant button exists
    const aiButton = await page.$('[class*="rounded-full"]');
    console.log(`✅ AI Assistant button found: ${aiButton ? 'YES' : 'NO'}`);
    
    // Click the AI assistant button if it exists
    if (aiButton) {
      console.log('🤖 Clicking AI Assistant button...');
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      // Check if chat window opened
      const chatWindow = await page.$('[class*="Card"]');
      console.log(`✅ Chat window opened: ${chatWindow ? 'YES' : 'NO'}`);
      
      // Try to find the textarea
      const textarea = await page.$('textarea');
      console.log(`✅ Textarea found: ${textarea ? 'YES' : 'NO'}`);
      
      if (textarea) {
        console.log('💬 Testing message input...');
        await textarea.type('Hello, this is a test message!');
        await page.waitForTimeout(1000);
        
        // Try to find and click send button
        const sendButton = await page.$('button[class*="bg-primary"]');
        if (sendButton) {
          console.log('📤 Clicking send button...');
          await sendButton.click();
          await page.waitForTimeout(5000); // Wait for response
        }
      }
    }
    
    // Report console messages
    console.log('\n📊 Console Messages:');
    console.log('=' .repeat(50));
    
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');
    const logMessages = consoleMessages.filter(msg => msg.type === 'log');
    
    console.log(`❌ Errors: ${errorMessages.length}`);
    errorMessages.forEach(msg => console.log(`   - ${msg.text}`));
    
    console.log(`⚠️  Warnings: ${warningMessages.length}`);
    warningMessages.forEach(msg => console.log(`   - ${msg.text}`));
    
    console.log(`ℹ️  Logs: ${logMessages.length}`);
    logMessages.slice(0, 5).forEach(msg => console.log(`   - ${msg.text}`));
    
    // Report page errors
    console.log(`\n💥 Page Errors: ${errors.length}`);
    errors.forEach(error => console.log(`   - ${error}`));
    
    // Take a screenshot
    await page.screenshot({ path: 'ai-assistant-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved as ai-assistant-test.png');
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📋 SUMMARY');
    console.log('=' .repeat(50));
    
    const hasErrors = errorMessages.length > 0 || errors.length > 0;
    console.log(`Overall Status: ${hasErrors ? '❌ ISSUES FOUND' : '✅ ALL GOOD'}`);
    
    if (!hasErrors) {
      console.log('🎉 AI Assistant UI is working without console errors!');
    } else {
      console.log('⚠️ Found issues that need to be addressed.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testUIConsole().catch(console.error);
