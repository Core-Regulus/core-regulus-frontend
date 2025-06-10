import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

let gBrowser = null;

async function init() {
  if (gBrowser == null)
    gBrowser = await getBrowser();
  return gBrowser;
}

async function getBrowser() {  
  const executablePath =  
    await chromium.executablePath();
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });  
}

export async function getPage(url) {
  const page = await gBrowser.newPage();
  await page.goto(url);
  return page;
}

export async function loadPage(url) {   
  await init();
  const page = await getPage(url);
  const html_contents = await page.content();
  await page.close();
  await close();
  return html_contents;
}

export async function setTitle(page, title) {
  await page.evaluate((args) => {
    document.title = args.title;
  }, { title });
}

export async function close() {
  await gBrowser.close();
  gBrowser = null;
}

export default {
  init,
  loadPage,
  getBrowser,
  getPage,
  loadPage,
  setTitle,
  close
}

