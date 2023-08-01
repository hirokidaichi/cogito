import { Func } from "./func.ts";
import { toHashString } from "https://deno.land/std@0.188.0/crypto/to_hash_string.ts";

const encoder = new TextEncoder();
async function sha256(input: string): Promise<string> {
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHashString(digest);
}

const generateKey = (header: string, input: unknown) => {
  return sha256(header + JSON.stringify(input));
};

export abstract class IStore<Input, Output> {
  constructor(private target: Func<Input, Output>) {}
  abstract get(input: Input): Promise<Output | undefined>;
  abstract set(input: Input, output: Output): Promise<void>;

  public async generateKey(input: Input) {
    const key = await generateKey(this.target.asTypeScript(), input);
    //console.log(this.target.name, key);
    return key;
  }
}

export class MemoryStore<Input, Output> extends IStore<Input, Output> {
  private cache = new Map<string, Output>();

  public async get(input: Input) {
    const key = await this.generateKey(input);
    return await this.cache.get(key);
  }
  public async set(input: Input, output: Output) {
    const key = await this.generateKey(input);
    this.cache.set(key, output);
  }
}
export class PersistentStore<Input, Output> extends IStore<Input, Output> {
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

  public async get(input: Input): Promise<Output | undefined> {
    const kv = await this.kv();
    const key = await this.generateKey(input);
    const ret = await kv.get<Output>([key]);
    return ret.value ? ret.value : undefined;
  }
  public async set(input: Input, output: Output): Promise<void> {
    const kv = await this.kv();
    const key = await this.generateKey(input);
    await kv.set([key], output);
  }
}
