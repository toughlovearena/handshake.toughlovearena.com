import simpleGit, { SimpleGit } from 'simple-git';
import { rebuild } from './rebuild';

export interface UpdaterOptions {
  timeout?: number;
}

export class Updater {
  static readonly defaultTimeout = 30 * 1000; // 30 seconds

  readonly timeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: UpdaterOptions) {
    this.timeout = options?.timeout ?? Updater.defaultTimeout;
  }

  protected async status(): Promise<boolean> {
    const sg: SimpleGit = simpleGit();
    await sg.fetch();
    const status = await sg.status();
    return status.behind > 0;
  }
  protected async update(): Promise<void> {
    await rebuild();
  }

  async run() {
    if (this.rebuilding) {
      return;
    }

    const changes = await this.status();

    if (this.rebuilding) {
      return;
    }

    if (changes) {
      this.clear();
      this.rebuilding = true;
      await this.update();
    }
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
  }
  isRunning() {
    return this.interval !== undefined;
  }
  cron() {
    this.clear();
    this.interval = setInterval(() => this.run(), this.timeout);
  }
}
