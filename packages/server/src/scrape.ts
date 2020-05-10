import cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import {serverLogger} from './logger';

const WINDOW_HEIGHT = 1200;
const WINDOW_WIDTH = 800;

export interface IProduct {
  name: string;
  originalPrice: string;
  salePrice: string;
  size: string;
}

export interface ISelectors {
  productSelector: string;
  productName: string;
  originalPrice: string;
  salePrice: string;
  size: string;
}

const browser = puppeteer.launch({
  headless: true,
});

export async function scrape(url: string, selectors: ISelectors) {
  const html = await getHTML(url);

  const $ = cheerio.load(html);

  const scrapedProducts = $(selectors.productSelector);
  if (!scrapedProducts) {
    serverLogger.log('warn', `WARNING: the CSS selector ${selectors.productSelector} was not found on the page!`);
  }

  const products: IProduct[] = [];

  scrapedProducts.each((i: number, elem: CheerioElement) => {
    products.push({
      name: getElementText($, selectors.productName, elem),
      originalPrice: getElementText($, selectors.originalPrice, elem),
      salePrice: getElementText($, selectors.salePrice, elem),
      size: getElementText($, selectors.size, elem),
    });
  });

  return products;
}

function getElementText($: CheerioStatic, selector: string, context: CheerioElement) {
  const text = $(selector, context).text().trim().toLowerCase();
  if (!text) {
    serverLogger.log('warn', `WARNING: the CSS selector ${selector} was not found in ${context.name}`);
  }
  return text;
}

async function getHTML(url: string) {
  serverLogger.log('info', `STARTED: Scraping HTML from ${url}`);
  const page = await (await browser).newPage();
  await page.setViewport({
    width: WINDOW_HEIGHT,
    height: WINDOW_WIDTH,
  });
  await page.goto(url);

  serverLogger.log('info', `PUPPETEER: Loaded ${url}`);

  await scrollToBottom(page);
  await page.waitFor(500);
  const html = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });
  await page.close();

  serverLogger.log('info', `FINISHED: Scraping HTML from ${url}`);
  return html;
}

// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function scrollToBottom(page: puppeteer.Page) {
  serverLogger.log('info', `PUPPETEER: Commencing scroll on ${page.url()}`);
  const distance = WINDOW_HEIGHT*(3/4); // should be less than or equal to window.innerHeight
  const delay = 25;
  while (await page.evaluate(() => document.scrollingElement!.scrollTop + window.innerHeight < document.scrollingElement!.scrollHeight)) {
    await page.evaluate((y: any) => { document.scrollingElement!.scrollBy(0, y); }, distance);
    await page.waitFor(delay);
  }
  serverLogger.log('info', `PUPPETEER: Finished scroll on ${page.url()}`);
}
