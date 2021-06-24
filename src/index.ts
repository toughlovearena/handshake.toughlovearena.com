import { Updater } from '@toughlovearena/updater';
import { Server } from './server';

(async () => {
  // start leaderboard server
  const updater = new Updater();
  new Server(updater).listen(2500);
  updater.cron();
})();
