import {executeScrapes} from './executer';
import ms from 'milliseconds';

const SCHEDULE = ms.hours(6);

export class Scheduler {
  timer: NodeJS.Timeout | number = setTimeout(() => {});
  startRecurringScrapes() {
    this.timer = setTimeout(async () => {
      await executeScrapes();
      this.startRecurringScrapes();
    }, SCHEDULE);
  }
}
