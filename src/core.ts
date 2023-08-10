import { SandboxWorker } from "./sandboxworker.ts";
import { func } from "./func.ts";
import { FunctionSet } from "./functionset.ts";
import { talker } from "./talker.ts";
import { thinker } from "./thinker.ts";
import { programmer } from "./programmer.ts";
import { logger } from "./logger.ts";
import { settings } from "./settings.ts";
export { z } from "./deps.ts";

export const cogito = {
  func,
  thinker,
  talker,
  programmer,
  functionset: FunctionSet.create,
  sandbox: SandboxWorker.create,
  settings,
  logger,
};
