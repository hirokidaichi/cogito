import { cogito as core } from "./src/core.ts";
export { z } from "./src/deps.ts";
import { textfile } from "./ext/textfile.ts";
import { tool } from "./ext/tool.ts";
import { command } from "./ext/command.ts";
import { memoize, memoizePersistent } from "./ext/memoize.ts";

export const cogito = {
  ...core,
  textfile,
  tool,
  command,
  memoize,
  memoizePersistent,
};
