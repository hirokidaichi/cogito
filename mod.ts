import { cogito as core } from "./src/core.ts";
export { z } from "./src/deps.ts";
import { textfile } from "./src/textfile.ts";
export const cogito = {
  ...core,
  textfile,
};
