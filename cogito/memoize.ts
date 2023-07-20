import { Func, func } from "./func.ts";

abstract class IStore<Input, Output> {
  constructor(private target: Func<Input, Output>) {}
  abstract get(input: Input): Promise<Output | undefined>;
  abstract set(input: Input, output: Output): void;
}

class Store<Input, Output> extends IStore<Input, Output> {
  private cache = new Map<string, Output>();

  public async get(input: Input) {
    const key = JSON.stringify(input);
    return await this.cache.get(key);
  }
  public set(input: Input, output: Output) {
    const key = JSON.stringify(input);
    this.cache.set(key, output);
  }
}
class PersistentStore<Input, Output> extends IStore<Input, Output> {
  private _kv?: Deno.Kv;
  constructor(target: Func<Input, Output>, private path?: string) {
    super(target);
  }
  public async kv() {
    if (this._kv) {
      return this._kv;
    }
    this._kv = await Deno.openKv(this.path);
    return this._kv;
  }
  public key(input: Input) {
    return JSON.stringify(input);
  }
  public async get(input: Input): Promise<Output | undefined> {
    const kv = await this.kv();
    const key = this.key(input);
    const ret = await kv.get<Output>([key]);
    return ret.value ? ret.value : undefined;
  }
  public set(input: Input, output: Output): void {
    (async () => {
      const kv = await this.kv();
      const key = JSON.stringify(input);
      await kv.set([key], output);
    })();
  }
}

export const memoize = <Input, Output>(
  target: Func<Input, Output>,
  store?: IStore<Input, Output>,
) => {
  const cache = (store) ? store : new Store<Input, Output>(target);
  return func(
    `${target.name}_cached`,
    {
      description: target.description,
      input: target.input,
      output: target.output,

      callback: async (input: Input) => {
        const val = await cache.get(input);
        if (val) {
          return val;
        }
        const output = await target.call(input);
        cache.set(input, output);
        return output;
      },
    },
  );
};

export const memoizePersistent = <Input, Output>(
  target: Func<Input, Output>,
  path?: string,
) => {
  const cache = new PersistentStore<Input, Output>(target, path);
  return memoize(target, cache);
};
