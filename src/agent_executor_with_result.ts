import { z } from "./deps.ts";
import { Parser } from "./parser.ts";
import { Agent } from "./agent.ts";
import { AgentExecutor } from "./agent_executor.ts";
import { settings } from "./settings.ts";
import { logger } from "./logger.ts";
import { compactForGoal } from "./chain.ts";

const answeringMessage = () =>
  `You need to answer in ${settings.get("language")}`;

export class AgentExecutorWithResult<Output> extends AgentExecutor {
  private parser: Parser<Output>;
  constructor(
    public agent: Agent,
    public prompt: string,
    public outputSchema: z.ZodType<Output>,
  ) {
    super(agent, prompt);
    this.parser = new Parser(outputSchema);
  }

  public async compact(output: string) {
    if (output.length < 5000) {
      return output;
    }
    const instruction = this.parser.instructions();
    const lang = answeringMessage();
    const goal = `${this.prompt}\n${instruction}\n${lang}`;
    const compactResult = await compactForGoal(goal, output);
    return compactResult;
  }
  public setup(): void {
    const instruction = this.parser.instructions();
    this.agent.addUserMessage(this.prompt);
    this.agent.addSystemMessage(answeringMessage());
    this.agent.addSystemMessage(
      "Please call the necessary tools as needed, consider the answer, and ultimately generate a JSON in the specified format.",
    );
    this.agent.addSystemMessage(instruction);
  }
  public async output(): Promise<Output> {
    await this.exec();
    return await this.parseLastMessageWithRetryCount(
      settings.get("agent_retry_count"),
    );
  }
  private async parseLastMessageWithRetryCount(count: number) {
    for (let i = 0; i < count; i++) {
      const res = await this.parseLastMessage();
      if (res.success) {
        return res.data;
      } else {
        const error = res.error;
        logger.warn(`retry:${i + 1}:\n${error.message}`);
        this.agent.addSystemMessage(
          `Parse Error :\n ${error.message}\n\nPlease try again.`,
        );
        await this.agent.chat();
      }
    }
    throw new Error("parse error");
  }
  private async parse(message: string) {
    return await this.parser.parse(message);
  }
  private async parseLastMessage() {
    const last = this.lastMessage();
    return await this.parse(last);
  }
}
