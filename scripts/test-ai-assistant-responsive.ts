#!/usr/bin/env node

/**
 * Test script to verify AI Assistant responsive design
 * Tests mobile, tablet, and desktop layouts
 */

import { chromium, Browser, Page } from 'playwright';

interface TestViewport {
  name: string;
  width: number;
  height: number;
  isMobile?: boolean;
}

const viewports: TestViewport[] = [
  { name: 'Mobile Small', width: 375, height: 667, isMobile: true },
  { name: 'Mobile Large', width: 414, height: 896, isMobile: true },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
];

async function testAIAssistantResponsiveness() {
  console.log('🚀 Starting AI Assistant Responsiveness Tests...\n');

  const browser: Browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visual inspection
  });

  try {
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const page: Page = await browser.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to the home page
      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');
      
      // Wait for the AI Assistant button to be visible
      const aiButton = page.locator('[data-testid="ai-assistant-button"], button:has(svg)').last();
      await aiButton.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log(`  ✅ AI Assistant button visible`);
      
      // Take screenshot of closed state
      await page.screenshot({ 
        path: `test-screenshots/ai-assistant-closed-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: false
      });
      
      // Click to open AI Assistant
      await aiButton.click();
      await page.waitForTimeout(1000); // Wait for animation
      
      // Check if AI Assistant is open
      const aiAssistant = page.locator('[data-testid="ai-assistant"], .fixed:has(h1, h2, h3)').first();
      await aiAssistant.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log(`  ✅ AI Assistant opened successfully`);
      
      // Test responsive behavior
      if (viewport.isMobile) {
        // On mobile, should be full screen or near full screen
        const assistantBox = await aiAssistant.boundingBox();
        if (assistantBox) {
          const coverageX = assistantBox.width / viewport.width;
          const coverageY = assistantBox.height / viewport.height;
          
          console.log(`  📏 Mobile coverage: ${(coverageX * 100).toFixed(1)}% width, ${(coverageY * 100).toFixed(1)}% height`);
          
          if (coverageX > 0.8 && coverageY > 0.7) {
            console.log(`  ✅ Good mobile coverage`);
          } else {
            console.log(`  ⚠️  Mobile coverage might be insufficient`);
          }
        }
        
        // Check for backdrop on mobile
        const backdrop = page.locator('.fixed.inset-0.bg-black\\/50, .fixed.inset-0[class*="bg-black"]');
        const hasBackdrop = await backdrop.count() > 0;
        console.log(`  ${hasBackdrop ? '✅' : '❌'} Mobile backdrop ${hasBackdrop ? 'present' : 'missing'}`);
        
      } else {
        // On desktop/tablet, should be floating
        const assistantBox = await aiAssistant.boundingBox();
        if (assistantBox) {
          const coverageX = assistantBox.width / viewport.width;
          const coverageY = assistantBox.height / viewport.height;
          
          console.log(`  📏 Desktop coverage: ${(coverageX * 100).toFixed(1)}% width, ${(coverageY * 100).toFixed(1)}% height`);
          
          if (coverageX < 0.6 && coverageY < 0.9) {
            console.log(`  ✅ Good desktop floating design`);
          } else {
            console.log(`  ⚠️  Desktop layout might be too large`);
          }
        }
      }
      
      // Test input area responsiveness
      const textarea = page.locator('textarea');
      const sendButton = page.locator('button:has(svg):near(textarea)').last();
      
      await textarea.waitFor({ state: 'visible' });
      await sendButton.waitFor({ state: 'visible' });
      
      console.log(`  ✅ Input area responsive`);
      
      // Take screenshot of open state
      await page.screenshot({ 
        path: `test-screenshots/ai-assistant-open-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: false
      });
      
      // Test typing and interaction
      await textarea.fill('Hello, this is a test message to check text wrapping and responsiveness.');
      await page.waitForTimeout(500);
      
      console.log(`  ✅ Text input working`);
      
      // Close the assistant
      const closeButton = page.locator('button:has(svg):near(h1, h2, h3)').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);
        console.log(`  ✅ Close button working`);
      } else if (viewport.isMobile) {
        // Try clicking backdrop on mobile
        const backdrop = page.locator('.fixed.inset-0');
        if (await backdrop.count() > 0) {
          await backdrop.click();
          await page.waitForTimeout(500);
          console.log(`  ✅ Mobile backdrop close working`);
        }
      }
      
      await page.close();
      console.log(`  ✅ ${viewport.name} test completed\n`);
    }
    
    console.log('🎉 All responsiveness tests completed!');
    console.log('📸 Screenshots saved to test-screenshots/ directory');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try {
  mkdirSync('test-screenshots', { recursive: true });
} catch (e) {
  // Directory might already exist
}

// Run the tests
testAIAssistantResponsiveness().catch(console.error);
