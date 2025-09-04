import { test, expect } from '@playwright/test';

test.describe('Reddit Publishing Test', () => {
  const baseURL = 'https://codersinflow.com';
  
  test('Publish a post to Reddit', async ({ page }) => {
    // 1. Login
    console.log('Step 1: Logging in...');
    await page.goto(`${baseURL}/blog/editor/login`);
    await page.fill('input[type="email"]', 'sales@codersinflow.com');
    await page.fill('input[type="password"]', 'F0r3st40!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/blog/editor`);
    console.log('✅ Logged in');
    
    // 2. Go to posts
    console.log('Step 2: Navigating to posts...');
    await page.click('a[href="/blog/editor/posts"]');
    await page.waitForLoadState('networkidle');
    
    // 3. Edit first post
    console.log('Step 3: Opening post editor...');
    const firstPost = await page.locator('a[href*="/blog/editor/posts/edit/"]').first();
    await firstPost.click();
    await page.waitForLoadState('networkidle');
    
    // 4. Click Publish to Social Media button
    console.log('Step 4: Opening social publish modal...');
    await page.click('button:has-text("Publish to Social Media")');
    await page.waitForTimeout(1000);
    
    // 5. Select Reddit
    console.log('Step 5: Selecting Reddit...');
    await page.click('text=Reddit');
    
    // 6. Enter subreddit
    console.log('Step 6: Entering subreddit...');
    const subredditField = await page.locator('input[placeholder*="subreddit"]');
    await subredditField.fill('test');
    
    // 7. Click publish
    console.log('Step 7: Publishing to Reddit...');
    await page.click('button:has-text("Publish to 1 Platform")');
    
    // 8. Wait for response
    console.log('Step 8: Waiting for result...');
    await page.waitForTimeout(5000);
    
    // Check for success or error - wait longer and be more comprehensive
    console.log('Looking for success/error messages...');
    
    // Wait for any response message to appear
    await page.waitForTimeout(2000);
    
    // Look for various success indicators
    const successSelectors = [
      'text=Published',
      'text=success',
      'text=Success',
      'text=posted',
      'text=shared',
      '[class*="success"]',
      '[class*="published"]'
    ];
    
    // Look for various error indicators
    const errorSelectors = [
      'text=error',
      'text=Error',
      'text=failed',
      'text=Failed',
      '[class*="error"]',
      '[class*="failed"]'
    ];
    
    let foundSuccess = false;
    let foundError = false;
    let resultMessage = '';
    
    // Check for success messages
    for (const selector of successSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        foundSuccess = true;
        resultMessage = await element.textContent() || '';
        console.log(`✅ Success indicator found: "${resultMessage}" (selector: ${selector})`);
        break;
      }
    }
    
    // Check for error messages if no success found
    if (!foundSuccess) {
      for (const selector of errorSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          foundError = true;
          resultMessage = await element.textContent() || '';
          console.log(`❌ Error indicator found: "${resultMessage}" (selector: ${selector})`);
          break;
        }
      }
    }
    
    // Log all visible text to help debug
    const modalContent = await page.locator('[role="dialog"], .modal, [class*="modal"]').textContent();
    console.log('📝 Modal content:', modalContent);
    
    // Look specifically for Reddit URL
    const urlLink = await page.locator('a[href*="reddit.com"]').first();
    if (await urlLink.isVisible()) {
      const url = await urlLink.getAttribute('href');
      console.log(`📍 Reddit URL found: ${url}`);
    }
    
    // Final result summary
    if (foundSuccess) {
      console.log('✅ SUCCESS: Reddit post appears to have been published successfully!');
    } else if (foundError) {
      console.log('❌ ERROR: Reddit publishing failed');
    } else {
      console.log('⚠️ UNCLEAR: No definitive success or error message detected');
    }
    
    // Take screenshot after waiting for results
    await page.screenshot({ path: 'test-results/reddit-publish-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');
  });
});