import {executeScrapes, runAllUsersJobs} from './executer';
import ms from 'milliseconds';

require('dotenv').config();

const SCHEDULE = ms.hours(parseInt(process.env.SCHEDULE_HOURS || '') || 12);

export class Scheduler {
  timer: NodeJS.Timeout | number = setTimeout(() => {});
  startRecurringScrapes() {
    this.timer = setTimeout(async () => {
      await executeScrapes();
      // process all user jobs
      await runAllUsersJobs();
      this.startRecurringScrapes();
    }, SCHEDULE);
  }
}
