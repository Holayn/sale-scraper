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

export async function scrape(url: string, selectors: ISelectors, keywords: string[]) {
  const res = await axios.get(url);
  const html = res.data;

  const $ = cheerio.load(html);

  const scrapedProducts = $(selectors.productSelector);

  const products: IProduct[] = [];

  scrapedProducts.each((i: number, elem: CheerioElement) => {
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

  return products;
}
