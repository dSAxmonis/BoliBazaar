const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  page.on('response', response => {
    console.log('RESPONSE:', response.url(), response.status());
  });

  await page.goto('http://localhost:5173/login', {waitUntil: 'networkidle0'});
  
  await page.type('input[type="email"]', 'test@test.com');
  await page.type('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
