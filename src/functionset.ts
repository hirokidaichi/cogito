import type { IFunctionAny } from "./type.ts";
import { gzipSearch } from "./gzipseeker.ts";
export type FunctionSetOption = {
  functions?: FunctionSet | IFunctionAny[];
};
export class FunctionSet {
  constructor(public functions: Map<string, IFunctionAny> = new Map()) {}

  public add(...funcs: IFunctionAny[]) {
    funcs.forEach((func) => this.functions.set(func.name, func));

    return this;
  }
  public remove(func: IFunctionAny) {
    this.functions.delete(func.name);
  }
  public get(name: string) {
    return this.functions.get(name);
  }
  public list() {
    return Array.from(this.functions.values());
  }
  public names() {
    return Array.from(this.functions.keys());
  }
  public asObjectList() {
    return this.list().map((f) => f.asObject());
  }
  public asTypeScript() {
    return this.list().map((f) => f.asTypeScript()).join("\n\n");
  }
  public has(name: string) {
    return this.functions.has(name);
  }
  public length() {
    return this.functions.size;
  }
  public isEmpty() {
    return this.length() === 0;
  }
  public async call(name: string, arg: string) {
    const func = this.get(name);
    if (func) {
      return await func.exec(arg);
    }
    return null;
  }
  public semantics() {
    return this.list().map((f) => {
      return { name: f.name, description: f.description };
    });
  }
  public search(query: string, topK: number): FunctionSet {
    const result = gzipSearch(query, this.semantics(), topK);

    const list: IFunctionAny[] = [];
    for (const r of result) {
      const func = this.get(r.name);
      if (func) {
        list.push(func);
      }
    }

    return FunctionSet.create(list);
  }
  static create(options: IFunctionAny[] | FunctionSet | undefined) {
    if (!options) {
      return new FunctionSet();
    }
    if (options instanceof FunctionSet) {
      return options;
    }
    return new FunctionSet().add(...options);
  }
}
