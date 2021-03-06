import winston from 'winston';
import expressWinston from 'express-winston';
import loggly from 'winston-loggly-bulk';

require('dotenv').config();

export const middlewareLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json(),
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute (req, res) { return false; }, // optional: allows to skip some log messages based on request and/or response
});

const { combine, timestamp, printf } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
export const serverLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat,
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
if (process.env.LOGGLY_SUBDOMAIN && process.env.LOGGLY_CUSTOMER_TOKEN) {
  serverLogger.add(new loggly.Loggly({
    token: process.env.LOGGLY_CUSTOMER_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['sale-scraper-server'],
    json: true,
  }));
}

// https://stackoverflow.com/questions/48768758/measure-process-time-with-node-js
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;
export class PerformanceLogger {
  time: any;
  diff: any;
  start() {
    this.time = process.hrtime();
  }
  end() {
    this.diff = process.hrtime(this.time);
  }
  getTimeMS() {
    return Math.round((this.diff[0] * NS_PER_SEC + this.diff[1]) * MS_PER_NS);
  }
}
