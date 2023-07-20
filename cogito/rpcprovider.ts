const createUUID = () => crypto.randomUUID();

// deno-lint-ignore no-explicit-any
type PromiseResolve = (result: any) => void;
type RequestMessage = {
  category: "request";
  uuid: string;
  type: string;
  parameters: string;
};
type ResponseMessage = {
  category: "response";
  uuid: string;
  type: string;
  result: string;
};
type Message = RequestMessage | ResponseMessage;
type Event = {
  data: Message;
};
// deno-lint-ignore no-explicit-any
type Procedure = (...parammeters: any[]) => Promise<any>;

interface EventEmitter {
  postMessage: (message: unknown) => void;
  addEventListener: (name: string, callback: (event: Event) => void) => void;
}

export class RPCProvider {
  constructor(
    public name: string = "default",
    public core: EventEmitter,
    public procedureMap: Map<string, Procedure> = new Map(),
    public resolverMap: Map<string, PromiseResolve> = new Map(),
  ) {
  }
  public procedure(type: string) {
    return (...parameters: unknown[]) => {
      const uuid = createUUID();
      const message: RequestMessage = {
        category: "request",
        uuid,
        type,
        parameters: JSON.stringify(parameters),
      };
      this.core.postMessage(message);
      const response = new Promise((resolve) => {
        this.resolverMap.set(uuid, resolve);
      });
      return response;
    };
  }
  public async call(type: string, ...parameters: unknown[]) {
    return await this.procedure(type)(...parameters);
  }
  public register(type: string, procedure: Procedure) {
    this.procedureMap.set(type, procedure);
  }
  public observe() {
    this.core.addEventListener("message", async (event: Event) => {
      const message = event.data;
      if (message.category === "response") {
        const resolve = this.resolverMap.get(message.uuid);
        if (!resolve) {
          console.error("rpc not found", message.uuid);
          return;
        }
        const result = JSON.parse(message.result);
        resolve(result);
        this.resolverMap.delete(message.uuid);
        return;
      }
      if (message.category === "request") {
        const procedure = this.procedureMap.get(message.type);
        if (!procedure) {
          console.error("procedure not found", message.type);
          return;
        }
        const parammeters = JSON.parse(message.parameters);
        const result = await procedure(...parammeters);

        const response: ResponseMessage = {
          category: "response",
          uuid: message.uuid,
          type: message.type,
          result: JSON.stringify(result),
        };
        this.core.postMessage(response);
      }
    });
  }
}
