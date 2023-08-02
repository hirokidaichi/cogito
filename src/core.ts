import { SandboxWorker } from "./sandboxworker.ts";
import { func } from "./func.ts";
import { FunctionSet } from "./functionset.ts";
import { talker } from "./talker.ts";
import { thinker } from "./thinker.ts";
import { programmer } from "./programmer.ts";
import { command } from "./command.ts";
import { logger } from "./logger.ts";
import { memoize, memoizePersistent } from "./memoize.ts";
import { settings } from "./settings.ts";
export { z } from "./deps.ts";

export const cogito = {
  func,
  thinker,
  talker,
  command,
  programmer,
  functionset: FunctionSet.create,
  sandbox: SandboxWorker.create,
  memoize,
  memoizePersistent,
  settings,
  logger,
};
