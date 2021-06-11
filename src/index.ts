import { Updater } from '@toughlovearena/updater';
import simpleGit from 'simple-git';
import { Server } from './server';

(async () => {
  const gitLog = await simpleGit().log();
  const gitHash = gitLog.latest.hash;

  // start leaderboard server
  new Server(gitHash).listen(2500);
  new Updater().cron();
})();
