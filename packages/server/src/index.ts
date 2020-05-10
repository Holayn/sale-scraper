import express from 'express';

import { scrape, IProduct } from './scrape';
import { getSiteConfigs, getUserJobs, ISiteConfig, IUserJob } from './fetcher';
import { DB } from './db';
import {Store} from './store';

const PORT = process.env.PORT || 8000;

const app = express();

const db = new DB();

const store = new Store();

(async function init() {
  await db.connect();

  app.get('/executeScrapes', async (req: express.Request, res: express.Response) => {
    try {
      const siteConfigs = await getSiteConfigs(db);
      const scrapedProducts = await executeScrapes(siteConfigs);
      res.send(scrapedProducts);
    } catch (e) {
      res.statusMessage = e;
      res.sendStatus(500);
    }
  });

  app.get('/getUserProducts', async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.query.user_id as string;
      const userJobs = await getUserJobs(db, userId);
      
      res.send(processUserJobs(userJobs));
    } catch (e) {
      res.statusMessage = e;
      res.sendStatus(500);
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
})();

function processUserJobs(userJobs: IUserJob[]) {
  const retVal: {
    [siteConfigId:string]: {
      keywords: string[];
      name: string;
      url: string;
      products: IProduct[];
    }
  } = {};

  userJobs.forEach((userJob: IUserJob) => {
    const products: IProduct[] = [];
    const {keywords, siteConfigId} = userJob;
    const pastScrape = store.getScrape(siteConfigId);
    const scrapedProducts = pastScrape.products;
    scrapedProducts.forEach((scrapedProduct: IProduct) => {
      const productName = scrapedProduct.name;
      if (productName.match(keywords.join('|'))) {
        products.push(scrapedProduct)
      }
    });
    retVal[siteConfigId] = {
      keywords,
      products,
      name: pastScrape.siteConfig.name,
      url: pastScrape.siteConfig.url,
    }
  });

  return retVal;
}

async function executeScrapes(siteConfigs: ISiteConfig[]) {
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

async function executeScrape(siteConfig: ISiteConfig) {
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
