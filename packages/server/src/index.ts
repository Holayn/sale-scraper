import express from 'express';

import {Store} from './store';
import {middlewareLogger} from './logger';
import {executeScrapes, getUserProducts} from './executer';
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
      res.send(await getUserProducts(userId));
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
