import sendgrid from '@sendgrid/mail';

import { IScrapedFilteredProducts } from './executer';
import { serverLogger } from './logger';

require('dotenv').config();

const SERVER_URL = process.env.SERVER_URL || 'localhost:8000';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('no sendgrid api key');
}
sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendEmail(email: string, productsResult: IScrapedFilteredProducts[]) {
  let html = '';

  productsResult.forEach((productResult: IScrapedFilteredProducts) => {
    const sectionHtml = `
    <h3>${productResult.name} from ${productResult.url}</h3>
    <h4>New sale items since last scrape</h4>
    <h5>Filtering on ${productResult.keywords} excluding ${productResult.excludeKeywords}</h5>
    Products:
    ${(() => {
      let html = '';
      productResult.diff.forEach((product) => {
        html += `
          <ul>
            <li>
              Name: ${product.name}
            </li>
            <li>
              Original Price: ${product.originalPrice}
            </li>
            <li>
              Sale Price: ${product.salePrice}
            </li>
            <li>
              Size: ${product.size}
            </li>
          </ul>
        `;
      });
      return html;
    })()}
    <h5>Visit ${SERVER_URL}/getUserProducts?user_id=<YOUR_USER_ID> for all your sale items</h5>
    `;
    html += sectionHtml;
  });

  const msg = {
    html,
    to: email,
    from: 'rc.revenge@gmail.com',
    subject: 'New Sale Items',
    text: 'New Sale Items',
  };

  try {
    await sendgrid.send(msg);
  } catch (error) {
    serverLogger.error('ERROR', error);
  }
}
