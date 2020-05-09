import express from 'express';

import { scrape } from './scrape';
import { getScrapingJob } from './fetcher';
import { DB } from './db';
import {Store} from './store';

const PORT = process.env.PORT || 8000;

const app = express();

const db = new DB();

const store = new Store();

(async function init() {
  await db.connect();

  app.get('/executeScrape', async (req: express.Request, res: express.Response) => {
    try {
      const scrapedProducts = await executeScrape();
      res.send(scrapedProducts);
    } catch (e) {
      res.statusMessage = e;
      res.sendStatus(500);
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
})();

async function executeScrape() {
  const { id, url, selectors, keywords } = await getScrapingJob(db);
  const scrapedProducts = await scrape(url, selectors, keywords);
  store.storeScrape(id, scrapedProducts);
  return scrapedProducts;
}
