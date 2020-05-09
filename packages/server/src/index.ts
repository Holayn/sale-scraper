import { scrape } from './scrape';
import { getScrapingJob } from './fetcher';
import { DB } from './db';
import express from 'express';

const PORT = process.env.PORT || 8000;

const app = express();

const db = new DB();

(async function init() {
  await db.connect();

  app.get('/executeScrape', async (req: express.Request, res: express.Response) => {
    try {
      const scrapedProducts = await executeScrape();
      res.send(scrapedProducts);
    } catch (e) {
      res.sendStatus(500);
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
})();

async function executeScrape() {
  const { url, selectors, keywords } = await getScrapingJob(db);
  const scrapedProducts = await scrape(url, selectors, keywords);
  return scrapedProducts;
}
