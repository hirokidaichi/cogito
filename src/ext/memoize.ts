import { Func, func } from "../func.ts";
import { IStore, MemoryStore, PersistentStore } from "../cache.ts";

export const memoize = <Input, Output>(
  target: Func<Input, Output>,
  store?: IStore<Input, Output>,
) => {
  const cache = (store) ? store : new MemoryStore<Input, Output>(target);
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
        await cache.set(input, output);
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
