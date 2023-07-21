import { logger } from "./logger.ts";
type Token = {
  time: number;
  id: string;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export class Limitter {
  private history: number[] = [];
  public running = 0;
  public limitPerSecound: number;
  constructor(
    public limitPerMinute: number,
  ) {
    this.limitPerSecound = limitPerMinute / 60;
  }
  public genToken() {
    return {
      time: Date.now(),
      id: Math.random().toString(36).slice(10),
    };
  }
  public isOverRateLimitInSecond() {
    const now = Date.now();
    const insecond = this.history.filter((date) => {
      return (now - date) < SECOND;
    });

    return insecond.length > this.limitPerSecound;
  }
  public diffLastCall() {
    const now = Date.now();
    const last = this.history[this.history.length - 1];
    return now - last;
  }

  public async wait(interval: number) {
    await wait(interval);
  }
  public async call<Output>(callback: () => Promise<Output>): Promise<Output> {
    const entryCount = this.running++;
    if (this.diffLastCall() < 100) {
      await wait(100);
    }
    if (this.isOverRateLimitInSecond()) {
      const interval = (SECOND / this.limitPerSecound) * entryCount;
      await this.wait(interval);
    }
    this.history.push(Date.now());
    const result = await callback();
    this.running--;
    return result;
  }
}


