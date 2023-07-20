import { SandboxWorker } from "./sandboxworker.ts";
import { func } from "./func.ts";
import { FunctionSet } from "./functionset.ts";
import { Agent } from "./agent.ts";
import { thinker } from "./thinker.ts";
import { Programmer } from "./programmer.ts";
import { command } from "./command.ts";
import { logger } from "./logger.ts";
import { memoize, memoizePersistent } from "./memoize.ts";
import { settings } from "./settings.ts";
export { z } from "./deps.ts";

export const core = {
  agent: Agent.create,
  func: func,
  thinker: thinker,
  functionset: FunctionSet.create,
  programmer: Programmer.create,
  sandbox: SandboxWorker.create,
  command: command,
  memoize,
  memoizePersistent,
  settings,
  logger,
};
