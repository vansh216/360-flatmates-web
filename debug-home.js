const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept network and console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('response', async response => {
    if (response.url().includes('/flatmates/profiles') || response.url().includes('/properties')) {
      console.log(`\nAPI RESPONSE from ${response.url()}:`);
      console.log(`Status: ${response.status()}`);
      try {
        const body = await response.json();
        console.log(`Body keys: ${Object.keys(body)}`);
        if (Array.isArray(body)) {
           console.log(`Body is array of length: ${body.length}`);
        } else if (body.profiles) {
           console.log(`Profiles length: ${body.profiles.length}`);
        } else if (body.properties) {
           console.log(`Properties length: ${body.properties.length}`);
        } else if (body.results) {
           console.log(`Results length: ${body.results.length}`);
        }
      } catch(e) {
        console.log('Could not parse JSON body');
      }
    }
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    
    console.log("Filling login form...");
    // Adjust selectors based on typical forms or use general ones
    await page.fill('input[type="tel"], input[name="phone"]', '8178340031').catch(() => page.fill('input', '8178340031'));
    await page.fill('input[type="password"]', 'saksham123');
    
    console.log("Submitting form...");
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation to /home...");
    await page.waitForURL('**/home', { timeout: 10000 }).catch(e => console.log("Did not reach /home automatically"));
    
    if (!page.url().includes('/home')) {
      await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
    } else {
      await page.waitForLoadState('networkidle');
    }
    
    console.log("Current URL:", page.url());
    
    // Wait a bit for queries to settle
    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error("Error during playwright script:", err);
  } finally {
    await browser.close();
  }
})();
