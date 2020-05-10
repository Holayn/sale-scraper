import {ISiteConfig, fetchSiteConfigs, fetchUserJobs} from './fetcher';
import {IProduct, scrape} from './scrape';
import {serverLogger} from './logger';
import {store} from './index';
import { DB } from './db';

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

export async function getUserJobs(userId: string) {
  await init();
  return await fetchUserJobs(db, userId);
}
