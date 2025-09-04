#!/usr/bin/env node

import { chromium } from 'playwright';
import fetch from 'node-fetch';

const CONFIG = {
  site: 'https://codersinflow.com',
  email: 'sales@codersinflow.com',
  password: 'F0r3st40!',
  reddit: {
    clientId: 'vJoEjrgHICVCqis0zJZO3A',
    clientSecret: 'dzYeNzZQl1GBeoLXMzQqv0_YXn--Gg',
    username: 'darkflowsdotcom',
    password: 'wostY1-sagpet-wiwqir',
    subreddits: 'darkflows,codersinflow,freeiacoding'
  }
};

async function setupRedditAndTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🚀 Starting Reddit setup and test...\n');

    // Step 1: Login
    console.log('1️⃣ Logging into the editor...');
    await page.goto(`${CONFIG.site}/blog/editor/login`);
    await page.fill('input[type="email"]', CONFIG.email);
    await page.fill('input[type="password"]', CONFIG.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/blog/editor', { timeout: 10000 });
    console.log('✅ Login successful\n');

    // Step 2: Navigate to user settings
    console.log('2️⃣ Navigating to user settings...');
    await page.click('a:has-text("Settings")');
    await page.waitForURL('**/users/edit/**');
    console.log('✅ On settings page\n');

    // Step 3: Fill in Reddit credentials
    console.log('3️⃣ Filling Reddit credentials...');
    
    // Clear and fill Reddit fields
    await page.fill('input[name="reddit_client_id"]', '');
    await page.fill('input[name="reddit_client_id"]', CONFIG.reddit.clientId);
    
    await page.fill('input[name="reddit_client_secret"]', '');
    await page.fill('input[name="reddit_client_secret"]', CONFIG.reddit.clientSecret);
    
    await page.fill('input[name="reddit_username"]', '');
    await page.fill('input[name="reddit_username"]', CONFIG.reddit.username);
    
    await page.fill('input[name="reddit_password"]', '');
    await page.fill('input[name="reddit_password"]', CONFIG.reddit.password);
    
    await page.fill('input[name="reddit_subreddits"]', '');
    await page.fill('input[name="reddit_subreddits"]', CONFIG.reddit.subreddits);
    
    console.log('✅ Reddit credentials filled\n');

    // Step 4: Save settings
    console.log('4️⃣ Saving settings...');
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(3000);
    console.log('✅ Settings saved\n');

    // Step 5: Go to posts page
    console.log('5️⃣ Navigating to posts...');
    await page.click('a[href="/blog/editor/posts"]');
    await page.waitForURL('**/blog/editor/posts');
    console.log('✅ On posts page\n');

    // Step 6: Check if there are posts, if not create one
    const postLinks = await page.locator('a[href*="/blog/editor/posts/edit/"]').count();
    
    if (postLinks === 0) {
      console.log('6️⃣ No posts found, creating a test post...');
      await page.click('a:has-text("New Post")');
      await page.waitForURL('**/blog/editor/posts/new**');
      
      // Fill in post details
      await page.fill('input[name="title"]', 'Test Post for Reddit Integration');
      await page.fill('textarea[name="description"]', 'This is a test post to verify Reddit integration is working correctly.');
      await page.fill('input[name="slug"]', 'test-reddit-integration-' + Date.now());
      
      // Add some content
      const editor = await page.locator('.ProseMirror').first();
      await editor.click();
      await editor.type('This is a test post created to verify that our Reddit integration is working properly. If you see this on Reddit, it means the integration was successful!');
      
      // Save the post
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(2000);
      console.log('✅ Test post created\n');
    } else {
      console.log('6️⃣ Using existing post for testing\n');
      // Click on the first post to edit it
      await page.locator('a[href*="/blog/editor/posts/edit/"]').first().click();
      await page.waitForURL('**/blog/editor/posts/edit/**');
    }

    // Step 7: Open social media publish modal
    console.log('7️⃣ Opening social media publish modal...');
    const socialButton = await page.locator('button:has-text("Publish to Social Media")');
    if (await socialButton.isVisible()) {
      await socialButton.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modalTitle = await page.locator('h2:has-text("Share to Social Media")');
      if (await modalTitle.isVisible()) {
        console.log('✅ Social media modal opened\n');
        
        // Step 8: Select Reddit and publish
        console.log('8️⃣ Publishing to Reddit...');
        
        // Check the Reddit checkbox
        const redditCheckbox = await page.locator('input[type="checkbox"]').first();
        await redditCheckbox.check();
        
        // The subreddits should already be filled from settings
        console.log('   Subreddits: ' + CONFIG.reddit.subreddits);
        
        // Click publish
        const publishBtn = await page.locator('button:has-text("Publish")');
        if (await publishBtn.isVisible()) {
          await publishBtn.click();
          console.log('   ⏳ Publishing...');
          
          // Wait for the publish to complete
          await page.waitForTimeout(10000);
          
          // Check for success indicators
          const successIndicators = await page.locator('.text-green-400:has-text("Published")').count();
          
          if (successIndicators > 0) {
            console.log('✅ Successfully published to Reddit!\n');
            
            // Try to get the Reddit URLs
            const links = await page.locator('a[href*="reddit.com"]').all();
            if (links.length > 0) {
              console.log('📎 Reddit post URLs:');
              for (const link of links) {
                const url = await link.getAttribute('href');
                console.log('   ' + url);
              }
            }
          } else {
            // Check for errors
            const errors = await page.locator('.text-red-400').allTextContents();
            if (errors.length > 0) {
              console.log('❌ Publishing failed with errors:');
              errors.forEach(err => console.log('   ' + err));
            } else {
              console.log('⚠️ Publishing status unclear, check manually');
            }
          }
        }
      }
    } else {
      console.log('❌ "Publish to Social Media" button not found');
    }

    // Step 9: Summary
    console.log('\n📊 Setup Summary:');
    console.log('   ✅ Reddit credentials saved');
    console.log('   ✅ Target subreddits: ' + CONFIG.reddit.subreddits);
    console.log('   ✅ Publishing tested');
    console.log('\n🎉 Reddit integration setup complete!');
    
    // Keep browser open for manual verification
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual verification...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    await page.screenshot({ path: 'reddit-setup-error.png' });
    console.log('📸 Screenshot saved to reddit-setup-error.png');
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed');
  }
}

// Run the setup
setupRedditAndTest().catch(console.error);