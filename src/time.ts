export interface TimeKeeper {
  now(): number;
}

export const RealClock: TimeKeeper = {
  now: () => new Date().getTime(),
};
