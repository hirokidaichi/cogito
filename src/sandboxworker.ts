import type { IFunctionAny } from "./type.ts";
import { RPCProvider } from "./rpcprovider.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { logger } from "./logger.ts";

type SandboxOptions = {
  code: string;
} & FunctionSetOption;

const getRPCProviderCode = async () => {
  const url = new URL("./rpcprovider.ts", import.meta.url);
  const lib = await fetch(url);
  return await lib.text();
};

const createRPCSetupCode = (entry: string, funcList: IFunctionAny[]) => {
  const importing = funcList.map((func) => {
    const name = func.name;
    return func.asTypeScript(
      `//@ts-ignore rpc is unknown response \nreturn await rpc.call("${name}",input);`,
    );
  }).join("\n");
  return `
const rpc = new RPCProvider("${entry}", self);
${importing}
rpc.register("${entry}", ${entry});
rpc.observe();

  `;
};

const composeURL = async (
  entry: string,
  code: string,
  funcList: IFunctionAny[],
) => {
  const libCode = await getRPCProviderCode();
  const setupCode = createRPCSetupCode(entry, funcList);
  const fullCode = [libCode, setupCode, code, "\nrpc.setup();"];
  const blob = new Blob(fullCode, {
    type: "application/typescript",
  });
  const url = URL.createObjectURL(blob);
  return url;
};

type SandboxWorkerStatus =
  | "ready"
  | "running"
  | "calling"
  | "terminated"
  | "error";

export class SandboxWorker {
  public status: SandboxWorkerStatus = "ready";
  private rpc?: RPCProvider;
  private worker?: Worker;
  public error?: string;
  constructor(
    public entry: string,
    public code: string,
    public functions: FunctionSet,
  ) {
  }
  public isReady() {
    return this.status === "ready";
  }
  public isRunning() {
    return this.status === "running";
  }
  public isTerminated() {
    return this.status === "terminated";
  }
  public isError() {
    return this.status === "error";
  }

  public async start(): Promise<void> {
    if (this.status !== "ready") {
      throw new Error("sandbox is not ready");
    }
    const code = await composeURL(
      this.entry,
      this.code,
      this.functions.list(),
    );
    const worker = new Worker(
      code,
      {
        type: "module",
        // @ts-ignore deno is supoorted unstable version
        deno: { permissions: "none" },
      },
    );
    const rpc = new RPCProvider(`sandbox:${this.entry}`, worker);
    for (const func of this.functions.list()) {
      rpc.register(func.name, func.toFunction());
    }
    rpc.observe();
    this.rpc = rpc;
    return new Promise<void>((resolve, reject) => {
      worker.addEventListener("message", (e) => {
        if (e.data === "ready") {
          this.status = "running";
          this.worker = worker;
          resolve();
          return false;
        }
      });
      worker.addEventListener("error", (e) => {
        this.status = "error";
        this.error = e.message;
        worker.terminate();
        reject(e);
        e.preventDefault();
        logger.warn(`Sandbox Error: ${e.message}`);
        return true;
      });
    });
  }
  public async call(...parameters: unknown[]) {
    if (this.status !== "running" || !this.rpc) {
      throw new Error("sandbox is not running");
    }
    this.status = "calling";
    const result = await this.rpc.call(this.entry, ...parameters);
    this.status = "running";
    return result;
  }
  public terminate() {
    if (this.status !== "running" || !this.worker) {
      throw new Error("sandbox is not running");
    }
    this.worker.terminate();
    this.status = "terminated";
  }
  static create(entry: string, option: SandboxOptions) {
    const code = option.code;
    const functions = FunctionSet.create(option.functions);
    return new SandboxWorker(entry, code, functions);
  }
}
