import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser', fullyParallel:false, workers:1, reporter:'list',
  webServer:process.env.TEST_URL ? undefined : {command:'node scripts/serve.mjs',url:'http://127.0.0.1:8787',reuseExistingServer:true},
  use:{baseURL:process.env.TEST_URL || 'http://127.0.0.1:8787',launchOptions:{executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'}},
});
