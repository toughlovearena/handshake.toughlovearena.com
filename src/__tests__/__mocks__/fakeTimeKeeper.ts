import { TimeKeeper } from "../../time";

export class FakeTimeKeeper implements TimeKeeper {
  private state = 0;
  _set(state: number) { this.state = state; }
  _increment(num?: number) { this.state += (num || 1); }
  now() { return this.state; }
  sleepUntil() { return Promise.resolve(); }
}
