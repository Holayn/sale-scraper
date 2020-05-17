import {executeScrapes, runAllUsersJobs} from './executer';
import ms from 'milliseconds';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';

dayjs.extend(dayjsUtc);

require('dotenv').config();

const TIME_CHECK_INTERVAL = ms.hours(1);
const HOURS: string[] = (process.env.SCHEDULE_HOURS || '13,17,21').split(',');

export class Scheduler {
  timer: NodeJS.Timeout | number = setTimeout(() => {});
  startScheduledScrapes() {
    this.timer = setTimeout(async () => {
      for (let i=0; i<HOURS.length; i++) {
        if (dayjs.utc().hour() === parseInt(HOURS[i])) {
          await executeScrapes();
          // process all user jobs
          await runAllUsersJobs();
          return;
        }
      }
      this.startScheduledScrapes();
    }, TIME_CHECK_INTERVAL);
  }
}
