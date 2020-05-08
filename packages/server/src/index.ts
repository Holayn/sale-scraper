import {Scraper, ISelectors} from './scrape';

const selectors: ISelectors = {
  productSelector: '.product-tile-info',
  productName: '.product-name',
  originalPrice: '.product-standard-price',
  salePrice: '.product-sales-price',
  size: '.variantsize',
}
const keywords = ['jeans', 'skinny jeans', 'supima'];
Scraper.scrape('https://www.uniqlo.com/us/en/men/sale', selectors, keywords);
