import {ISiteConfig, IUserJob, fetchSiteConfigs, fetchUserJobs} from './fetcher';
import {IProduct, scrape} from './scrape';
import {serverLogger} from './logger';
import {store} from './index';
import { DB } from './db';
import {sendEmail} from './emailer';

export interface IScrapedFilteredProducts {
  keywords: string[];
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
  serverLogger.log('info', 'Executing all scrapes');
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
  return scrapedProductsMap;
}

export async function executeScrape(siteConfig: ISiteConfig) {
  const {id, url, name, selectors} = siteConfig;
  const scrapedProducts = await scrape(url, selectors);
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
  await init();
  return processUserJobs(await fetchUserJobs(db, userId));
}

function processUserJobs(userJobs: IUserJob[]) {
  const retVal: {
    [siteConfigId:string]: IScrapedFilteredProducts
  } = {};

  const emails: Record<string, IScrapedFilteredProducts[]> = {};

  userJobs.forEach((userJob: IUserJob) => {
    const {keywords, siteConfigId, email} = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const scrapedProducts = pastScrape.products;
    const filteredProducts = filterProducts(scrapedProducts, keywords);
    const result: IScrapedFilteredProducts = {
      keywords,
      products: filteredProducts,
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    };
    retVal[siteConfigId] = result;

    if (!emails[email]) {
      emails[email] = [];
    }
    emails[email].push(result);
  });

  // send emails
  for (const email in emails) {
    sendEmail(email, emails[email]);
  }

  return retVal;
}

function filterProducts(scrapedProducts: IProduct[], keywords: string[]) {
  const products: IProduct[] = [];
  scrapedProducts.forEach((scrapedProduct: IProduct) => {
    const productName = scrapedProduct.name;
    if (productName.match(keywords.join('|').toLowerCase())) {
      products.push(scrapedProduct)
    }
  });
  return products;
}
