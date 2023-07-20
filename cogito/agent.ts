import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "./deps.ts";
import { settings } from "./settings.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { functionMessage, systemMessage, userMessage } from "./message.ts";

const DEFAULT_CONFIG = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});
type AgentOptions = {
  configuration?: Configuration;
  api?: OpenAIApi;
  options?: {
    model?: string;
    top_p?: number;
    temperature?: number;
  };
  language?: string;
} & FunctionSetOption;

export class Agent {
  public functions: FunctionSet = new FunctionSet();
  constructor(
    public configuration = DEFAULT_CONFIG,
    public api = new OpenAIApi(configuration),
    public options = {
      model: settings.get("model"),
      top_p: 1,
      temperature: settings.get("temperature"),
    },
    public messages = [] as ChatCompletionRequestMessage[],
  ) {}

  public appendMessage(message: ChatCompletionRequestMessage) {
    this.messages.push(message);
  }

  public addSystemMessage(content: string) {
    this.appendMessage(systemMessage(content));
  }
  public addUserMessage(content: string) {
    this.appendMessage(userMessage(content));
  }
  public addFunctionMessage(name: string, content: string) {
    this.appendMessage(functionMessage(name, content));
  }
  public async guess() {
    const funcOptions = this.functions.isEmpty()
      ? {}
      : { functions: this.functions.asObjectList() };
    return await this.api.createChatCompletion({
      ...this.options,
      messages: this.messages,
      ...funcOptions,
    });
  }

  public async chat(message?: string) {
    if (message) {
      this.addUserMessage(message);
    }
    const res = await this.guess();
    const choice = res.data.choices[0];
    const resMessage = choice.message;
    if (resMessage) {
      this.appendMessage(resMessage);
    }
    return resMessage;
  }

  static create(agentOption?: AgentOptions) {
    if (agentOption) {
      const self = new Agent(
        agentOption.configuration ?? DEFAULT_CONFIG,
        agentOption.api,
      );
      self.functions = FunctionSet.create(agentOption.functions);
      return self;
    } else {
      return new Agent();
    }
  }
}
