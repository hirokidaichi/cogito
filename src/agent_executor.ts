import { settings } from "./settings.ts";
import { Agent } from "./agent.ts";
import { StructuredOutputParser, z } from "./deps.ts";
import { compactForGoal } from "./chain.ts";
import { logger } from "./logger.ts";
const answeringMessage = () =>
  `You need to answer in ${settings.get("language")}`;

type Success<T> = {
  isSuccess: true;
  value: T;
};

type Failure<E = Error> = {
  isSuccess: false;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

type Callback<T> = () => Promise<T>;

const trying = async <T>(callback: Callback<T>): Promise<Result<T>> => {
  try {
    const result = await callback();
    return {
      isSuccess: true,
      value: result,
    };
  } catch (e) {
    logger.warn(e);
    return {
      isSuccess: false,
      error: e,
    };
  }
  //return await callback();
};
export class AgentExecutor {
  constructor(
    public agent: Agent,
    public prompt: string,
  ) {}
  public async exec() {
    this.agent.addSystemMessage("You are a great assistant.");
    this.agent.addUserMessage(this.prompt);
    this.agent.addSystemMessage(answeringMessage());
    while (true) {
      const res = await this.agent.chat();
      if (res == undefined) break;
      if (res.function_call) {
        const { name, arguments: args } = res.function_call;
        if (name && this.agent.functions.has(name)) {
          const result = await this.agent.functions.call(name, args || "");
          this.agent.addFunctionMessage(name, JSON.stringify(result || ""));
          continue;
        }
      } else {
        return res.content;
      }
    }
  }
}

export class AgentExecutorWithResult<Output> {
  private parser: StructuredOutputParser<z.ZodType<Output>>;
  constructor(
    public agent: Agent,
    public prompt: string,
    public outputSchema: z.ZodType<Output>,
  ) {
    this.parser = new StructuredOutputParser(outputSchema);
  }
  public lastMessage() {
    return this.agent.messages.at(-1)?.content || "";
  }
  public outputParser() {
    return new StructuredOutputParser(this.outputSchema);
  }
  public async compact(output: string) {
    if (output.length < 5000) {
      return output;
    }
    const instruction = this.parser.getFormatInstructions();
    const lang = answeringMessage();
    const goal = `${this.prompt}\n${instruction}\n${lang}`;
    const compactResult = await compactForGoal(goal, output);
    return compactResult;
  }
  public async exec(): Promise<Output> {
    const instruction = this.parser.getFormatInstructions();
    this.agent.addUserMessage(this.prompt);
    this.agent.addSystemMessage(answeringMessage());
    this.agent.addSystemMessage(
      "Please call the necessary tools as needed, consider the answer, and ultimately generate a JSON in the specified format.",
    );

    this.agent.addSystemMessage(instruction);
    while (true) {
      const res = await this.agent.chat();
      if (res == undefined) break;
      if (!res.function_call) break;
      const { name, arguments: args } = res.function_call;
      if (name && this.agent.functions.has(name)) {
        const result = await trying(async () => {
          return await this.agent.functions.call(name, args || "");
        });
        const value = result.isSuccess ? result.value : result;

        this.agent.addFunctionMessage(
          name,
          await this.compact(JSON.stringify(value)),
        );
        this.agent.addSystemMessage(instruction);
        continue;
      }
      this.agent.addSystemMessage(`Function[${name}] is not found.`);
    }
    return await this.parseLastMessageWithRetryCount(
      settings.get("agent_retry_count"),
    );
  }
  private async parseLastMessageWithRetryCount(count: number) {
    for (let i = 0; i < count; i++) {
      const res = await this.parseLastMessage();
      if (res.isSuccess) {
        return res.value;
      } else {
        logger.warn(`retry:${i + 1}`, res.error.message);
        this.agent.addSystemMessage(this.parser.getFormatInstructions());
        this.agent.addSystemMessage(res.error.message);
        await this.agent.chat();
      }
    }
    throw new Error("parse error");
  }
  private async parseLastMessage(): Promise<Result<Output>> {
    const last = this.lastMessage();
    try {
      const parsed = await this.parser.parse(last);
      return { isSuccess: true, value: parsed };
    } catch (e) {
      return { isSuccess: false, error: e };
    }
  }
}
