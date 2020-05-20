import { IProduct } from './scrape';
// import {henlo} from './fwowa';
import { ISiteConfig } from './fetcher';

interface IPastRuns {
  [siteConfigId: string]: {
    products: IProduct[];
    siteConfig: ISiteConfig;
    diff: IProduct[];
  };
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
      diff: getProductsDiff(this.state.pastRuns[siteConfigId]?.products, payload.scrapedProducts),
    };
  }
  getScrape(siteConfigId: string) {
    return this.state.pastRuns[siteConfigId];
  }
}

function getProductsDiff(oldProducts: IProduct[], newProducts: IProduct[]): IProduct[] {
  if (!oldProducts) {
    return [];
  }
  const oldProductsSet: Set<string> = new Set();
  oldProducts.forEach((product) => {
    const key = `${product.name}_${product.salePrice}`;
    oldProductsSet.add(key);
  });

  const res: IProduct[] = [];
  newProducts.forEach((product) => {
    const key = `${product.name}_${product.salePrice}`;
    if (oldProductsSet.has(key)) {
      return;
    }
    res.push(product);
  });

  return res;

}
