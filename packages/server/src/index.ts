import express from 'express';

import { IProduct } from './scrape';
import { IUserJob } from './fetcher';
import {Store} from './store';
import {middlewareLogger} from './logger';
import {executeScrapes, getUserJobs} from './executer';
import {Scheduler} from './scheduler';

const PORT = process.env.PORT || 8000;

const app = express();
app.use(middlewareLogger);

export const store = new Store();
const scheduler = new Scheduler();

(async function init() {
  await initialScrape();

  scheduler.startRecurringScrapes();

  app.get('/getScrapes', async (req: express.Request, res: express.Response) => {
    const scrapedProducts = store.state.pastRuns;
    res.send(scrapedProducts);
  });

  app.get('/getUserProducts', async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.query.user_id as string;
      const userJobs = await getUserJobs(userId);
      
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

async function initialScrape() {
  await executeScrapes();
}

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
