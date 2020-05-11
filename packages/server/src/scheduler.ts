import {executeScrapes} from './executer';
import ms from 'milliseconds';

require('dotenv').config();

const SCHEDULE = ms.hours(parseInt(process.env.SCHEDULE_HOURS || '') || 1);

export class Scheduler {
  timer: NodeJS.Timeout | number = setTimeout(() => {});
  startRecurringScrapes() {
    this.timer = setTimeout(async () => {
      await executeScrapes();
      this.startRecurringScrapes();
    }, SCHEDULE);
  }
}
