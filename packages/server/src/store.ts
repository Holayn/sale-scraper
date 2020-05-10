import {IProduct} from './scrape';
// import {henlo} from './fwowa';
import {ISiteConfig} from './fetcher';

interface IPastRuns {
  [siteConfigId: string]: {
    products: IProduct[];
    siteConfig: ISiteConfig;
  }
}

export class Store {
  state = {
    pastRuns: {} as IPastRuns,
  };
  storeScrape(siteConfigId: string, payload: {
    scrapedProducts: IProduct[],
    siteConfig: ISiteConfig,
  }) {
    this.state.pastRuns[siteConfigId] = {
      products: payload.scrapedProducts,
      siteConfig: payload.siteConfig,
    };
  };
  getScrape(siteConfigId: string) {
    return this.state.pastRuns[siteConfigId];
  }
}