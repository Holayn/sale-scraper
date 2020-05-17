import {ISiteConfig, IUserJob, fetchSiteConfigs, fetchUserJobs} from './fetcher';
import {IProduct, scrape} from './scrape';
import {serverLogger} from './logger';
import {store} from './index';
import { DB } from './db';
import {sendEmail} from './emailer';

export interface IScrapedFilteredProducts {
  keywords: string[];
  excludeKeywords: string[];
  name: string;
  url: string;
  products: IProduct[];
}

const db = new DB();

async function init() {
  await db.connect();
}

export async function executeScrapes() {
  await init();
  serverLogger.log('info', 'STARTED: Executing all scrapes');
  const siteConfigs: ISiteConfig[] = await fetchSiteConfigs(db);
  const scrapedProductsMap: Record<string, {name: string, url: string, scrapedProducts: IProduct[]}> = {};
  for (let i=0; i<siteConfigs.length; i++) {
    const {id, scrapedProducts, name, url} = await executeScrape(siteConfigs[i]);
    scrapedProductsMap[id] = {
      name,
      url,
      scrapedProducts,
    };
  }
  serverLogger.log('info', 'FINISHED: Executing all scrapes');
  return scrapedProductsMap;
}

export async function executeScrape(siteConfig: ISiteConfig) {
  const {id, url, name, selectors, dynamicScrolling} = siteConfig;
  const scrapedProducts = await scrape(url, selectors, dynamicScrolling);
  store.storeScrape(id, {
    scrapedProducts, 
    siteConfig
  });
  return {
    id,
    name,
    url,
    scrapedProducts,
  }
}

export async function getUserProducts(userId: string) {
  const retVal: {
    [siteConfigId:string]: IScrapedFilteredProducts
  } = {};

  const userJobs = await fetchUserJobs(db, userId);
  userJobs.forEach((userJob: IUserJob) => {
    const {keywords, siteConfigId, excludeKeywords} = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const filteredProducts = filterProducts(pastScrape.products, keywords, excludeKeywords);
    const result: IScrapedFilteredProducts = {
      keywords,
      excludeKeywords,
      products: filteredProducts,
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    };

    retVal[siteConfigId] = result;
  });

  return retVal;
}

export function processUserJobs(userJobs: IUserJob[]) {
  const emails: Record<string, IScrapedFilteredProducts[]> = {};

  userJobs.forEach((userJob: IUserJob) => {
    const {keywords, siteConfigId, email, excludeKeywords} = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const filteredProducts = filterProducts(pastScrape.products, keywords, excludeKeywords);
    const result: IScrapedFilteredProducts = {
      keywords,
      excludeKeywords,
      products: filteredProducts,
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    };

    if (!emails[email]) {
      emails[email] = [];
    }
    emails[email].push(result);
  });

  return emails;
}

export function sendEmails(emails:  Record<string, IScrapedFilteredProducts[]>) {
  for (const email in emails) {
    sendEmail(email, emails[email]);
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
      products.push(scrapedProduct)
    }
  });
  return products;
}
