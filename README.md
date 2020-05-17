# sale-scraper

A web-scraper designed to scrape sites periodically for sale items matching keywords.

Configured via configs stored in a mongodb instance.

### Environment variables
- `DB_URL`
- `DB_USER`
- `DB_PASS`
- `PORT`
- `SENDGRID_API_KEY`
- `SCHEDULE_HOURS` : comma-delineated UTC hours to run scraper and user jobs
- `SERVER_URL`

### DB schema

TODO