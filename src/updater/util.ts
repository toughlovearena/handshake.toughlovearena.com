export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// tslint:disable-next-line:no-console
export const log = console.log;
