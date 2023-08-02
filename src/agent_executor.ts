import { settings } from "./settings.ts";
import { Agent } from "./agent.ts";
import { compactForGoal } from "./chain.ts";

const answeringMessage = () =>
  `You need to answer in ${settings.get("language")}`;

export class AgentExecutor {
  constructor(
    public agent: Agent,
    public prompt: string,
  ) {}
  public async compact(output: string) {
    if (output.length < 5000) {
      return output;
    }
    const lang = answeringMessage();
    const goal = `${this.prompt}\n\n${lang}`;
    const compactResult = await compactForGoal(goal, output);
    return compactResult;
  }
  public lastMessage() {
    return this.agent.messages.at(-1)?.content || "";
  }

  public async safeCall(name: string, args: string) {
    try {
      const result = await this.agent.functions.call(name, args);
      return JSON.stringify({
        isSuccess: true,
        value: result,
      });
    } catch (e) {
      return JSON.stringify({
        isSuccess: false,
        error: e,
      });
    }
  }
  public setup() {
    this.agent.addSystemMessage("You are a great assistant.");
    this.agent.addUserMessage(this.prompt);
    this.agent.addSystemMessage(answeringMessage());
  }

  public async exec() {
    this.setup();
    while (true) {
      const res = await this.agent.chat();
      if (res == undefined) break;
      if (!res.function_call) break;
      const { name, arguments: args } = res.function_call;
      if (name && this.agent.functions.has(name)) {
        const result = await this.safeCall(name, args || "");
        this.agent.addFunctionMessage(
          name,
          await this.compact(result),
        );
        continue;
      }
      this.agent.addSystemMessage(`Function[${name}] is not found.`);
    }
    return this.lastMessage();
  }
}
