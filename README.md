# sale-scraper

A web-scraper designed to scrape sites periodically for sale items matching keywords.

Sends emails (at server pre-defined times) when sale items are added between scrapes.

Configured via configs stored in a mongodb instance.

### Environment variables
- `DB_URL`
- `DB_USER`
- `DB_PASS`
- `PORT` Default value: 8000
- `SENDGRID_API_KEY`
- `SCHEDULE_HOURS` : comma-delineated UTC hours to run scraper and user jobs. Default value: 13,17,21
- `SERVER_URL`: added to sent email so other endpoints may be hit
- `LOGGLY_CUSTOMER_TOKEN`
- `LOGGLY_SUBDOMAIN`

### Endpoints

- `/getUserProducts?user_id=<YOUR_USER_ID>`
  - returns your filtered scraped sale items from your sites
- `/getScrapes`
  - returns all scraped sale items from all sites scraped

### DB schema

**user-jobs** collection
```
  _id: string // unique id present in all mongodb items
  userId: string
  keywords: string[] // regular expressions
  excludeKeywords: string[] // regular expressions
  siteConfigId: string
  email: string
```

**site-configs** collection
```
  _id: string // unique id present in all mongodb items
  selectors: { // css selectors, typically will use class names i.e. .product-tile-info
    "productSelector": string // the entire sale element
    "productName": string
    "originalPrice": string
    "salePrice": string
    "size": string
    "link": string
  },
  url: string
  name: string
  dynamicScrolling: boolean // flag to specify use of puppeteer to simulate scrolling
```