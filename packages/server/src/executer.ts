import { ISiteConfig, IUserJob, fetchSiteConfigs, fetchUserJobs, fetchAllUsersJobs } from './fetcher';
import { IProduct, scrape } from './scrape';
import { serverLogger } from './logger';
import { store } from './index';
import { DB } from './db';
import { sendEmail } from './emailer';

export interface IScrapedFilteredProducts {
  keywords: string[];
  excludeKeywords: string[];
  name: string;
  url: string;
  products: IProduct[];
  diff: IProduct[];
}

const db = new DB();

async function init() {
  await db.connect();
}

export async function executeScrapes() {
  try {
    await init();
    serverLogger.log('info', 'STARTED: Executing all scrapes');
    const siteConfigs: ISiteConfig[] = await fetchSiteConfigs(db);
    const scrapedProductsMap: Record<string, {name: string, url: string, scrapedProducts: IProduct[]}> = {};
    for (let i = 0; i < siteConfigs.length; i++) {
      const config = siteConfigs[i];
      const scrapedProducts = await executeScrape(config);
      scrapedProductsMap[config.id] = {
        name: config.name,
        url: config.url,
        scrapedProducts,
      };
    }
    serverLogger.log('info', 'FINISHED: Executing all scrapes');
    return scrapedProductsMap;
  } catch (e) {
    serverLogger.error('ERROR', e);
  }
}

export async function executeScrape(siteConfig: ISiteConfig) {
  const { id, url, selectors, dynamicScrolling } = siteConfig;
  const scrapedProducts = await scrape(url, selectors, dynamicScrolling);
  store.storeScrape(id, {
    scrapedProducts,
    siteConfig,
  });
  return scrapedProducts;
}

export async function getUserProducts(userId: string) {
  const retVal: {
    [siteConfigId:string]: IScrapedFilteredProducts,
  } = {};

  const userJobs = await fetchUserJobs(db, userId);
  userJobs.forEach((userJob: IUserJob) => {
    const { keywords, siteConfigId, excludeKeywords } = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const result: IScrapedFilteredProducts = {
      keywords,
      excludeKeywords,
      products: filterProducts(pastScrape.products, keywords, excludeKeywords),
      diff: filterProducts(pastScrape.diff, keywords, excludeKeywords),
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    };

    retVal[siteConfigId] = result;
  });

  return retVal;
}

export async function runAllUsersJobs() {
  try {
    serverLogger.info('EXECUTER: RUNNING JOBS FOR ALL USERS');
    const allUsersJobs = await fetchAllUsersJobs(db);
    const emails = processUserJobs(allUsersJobs);
    sendEmails(emails);
  } catch (e) {
    serverLogger.error('ERROR', e);
  }
}

export function processUserJobs(userJobs: IUserJob[]) {
  const emails: Record<string, IScrapedFilteredProducts[]> = {};

  userJobs.forEach((userJob: IUserJob) => {
    const { keywords, siteConfigId, email, excludeKeywords } = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const result: IScrapedFilteredProducts = {
      keywords,
      excludeKeywords,
      products: filterProducts(pastScrape.products, keywords, excludeKeywords),
      diff: filterProducts(pastScrape.diff, keywords, excludeKeywords),
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    };

    if (!emails[email]) {
      emails[email] = [];
    }
    // don't add a result if there's no difference between the last scrape
    if (result.diff.length === 0) {
      return;
    }
    emails[email].push(result);
  });

  return emails;
}

export function sendEmails(emails:  Record<string, IScrapedFilteredProducts[]>) {
  for (const email in emails) {
    if (emails[email].length > 0) {
      sendEmail(email, emails[email]);
    }
  }
}

function filterProducts(scrapedProducts: IProduct[], keywords: string[], excludeKeywords: string[]) {
  const products: IProduct[] = [];
  scrapedProducts.forEach((scrapedProduct: IProduct) => {
    const productName = scrapedProduct.name;
    if (productName.match(excludeKeywords?.join('|').toLowerCase() ?? null)) {
      return;
    }
    if (productName.match(keywords.join('|').toLowerCase())) {
      products.push(scrapedProduct);
    }
  });
  return products;
}
