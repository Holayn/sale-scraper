import sendgrid from '@sendgrid/mail';

import {IScrapedFilteredProducts} from './executer';

require('dotenv').config();

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('no sendgrid api key');
}
sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendEmail(email: string, productsResult: IScrapedFilteredProducts[]) {
  let html = ``;

  productsResult.forEach((productResult: IScrapedFilteredProducts) => {
    const sectionHtml = `
    <h3>${productResult.name} from ${productResult.url}</h3>
    <h5>Filtering on ${productResult.keywords}</h5>
    Products:
    ${(() => {
      let html = ``;
      productResult.products.forEach((product) => {
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
    `
    html += sectionHtml;
  });

  const msg = {
    html,
    to: email,
    from: 'rc.revenge@gmail.com',
    subject: 'Sale Items',
    text: 'Sale Items',
  };

  try {
    await sendgrid.send(msg);
  } catch (error) {
    console.error(error);
 
    if (error.response) {
      console.error(error.response.body)
    }
  }
}