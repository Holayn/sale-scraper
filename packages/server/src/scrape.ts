import axios from 'axios';
import cheerio from 'cheerio';

interface IProduct {
  name: string;
  originalPrice: string;
  salePrice: string;
  size: string;
}

export interface ISelectors {
  productSelector: string;
  productName: string;
  originalPrice: string;
  salePrice: string;
  size: string;
}

export class Scraper {
  static scrape(url: string, selectors: ISelectors, keywords: string[]) {
    axios.get(url).then((res) => {
      const html = res.data;
      
      const $ = cheerio.load(html);
      
      const scrapedProducts = $(selectors.productSelector);
      
      const products: IProduct[] = [];
      
      scrapedProducts.each((i, elem) => {
        const productName = $(selectors.productName, elem).text().trim();
        if (productName.match(keywords.join('|'))) {
          products.push({
            name: productName,
            originalPrice: $(selectors.originalPrice, elem).text(),
            salePrice: $(selectors.salePrice, elem).text(),
            size: $(selectors.size, elem).text(),
          });
        }
      });
      
      console.log(products);
    });
  }
}
