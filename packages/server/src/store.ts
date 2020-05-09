import {IProduct} from './scrape';

interface IPastRuns {
  [key: string]: {
    products: IProduct;
  }
}

export class Store {
  state: Record<string, any> = {
    pastRuns: {} as IPastRuns,
  };
  storeScrape(scrapeId: string, products: IProduct[]) {
    this.state.pastRuns[scrapeId] = {
      products,
    }
    console.info(this.state.pastRuns);
  }
}