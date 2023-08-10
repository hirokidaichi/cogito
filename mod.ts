import { cogito as core } from "./src/core.ts";
export { z } from "./src/deps.ts";
import { textfile } from "./src/ext/textfile.ts";
import { tool } from "./src/ext/tool.ts";
import { command } from "./src/ext/command.ts";
import { memoize, memoizePersistent } from "./src/ext/memoize.ts";

export const cogito = {
  ...core,
  textfile,
  tool,
  command,
  memoize,
  memoizePersistent,
};
