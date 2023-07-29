import { cogito, z } from "./core.ts";

const result = z.enum(["success", "reserved"]);
type Result = z.infer<typeof result>;

const modifySchema = {
  create: z.object({ path: z.string(), content: z.string() }),
  insert: z.object({
    path: z.string(),
    content: z.string(),
    line: z.number(),
  }),
  replace: z.object({
    path: z.string(),
    content: z.string(),
    beginLine: z.number(),
    endLine: z.number(),
  }),
  append: z.object({ path: z.string(), content: z.string() }),
  remove: z.object({ path: z.string() }),
  rename: z.object({ path: z.string(), newPath: z.string() }),
};

const modifyInput = z.union([
  z.object({ type: z.literal("append"), value: modifySchema.append }),
  z.object({ type: z.literal("create"), value: modifySchema.create }),
  z.object({ type: z.literal("insert"), value: modifySchema.insert }),
  z.object({ type: z.literal("replace"), value: modifySchema.replace }),
  z.object({ type: z.literal("remove"), value: modifySchema.remove }),
  z.object({ type: z.literal("rename"), value: modifySchema.rename }),
]);

const modifyCallbacks = {
  create: async (
    { path, content }: z.infer<typeof modifySchema.create>,
  ): Promise<Result> => {
    await Deno.writeTextFile(path, content);
    return "success";
  },
  insert: async (
    { path, content, line }: z.infer<typeof modifySchema.insert>,
  ): Promise<Result> => {
    const text = await Deno.readTextFile(path);
    const lines = text.split("\n");
    lines.splice(line, 0, content);
    await Deno.writeTextFile(path, lines.join("\n"));
    return "success";
  },
  replace: async (
    { path, content, beginLine, endLine }: z.infer<typeof modifySchema.replace>,
  ): Promise<Result> => {
    const text = await Deno.readTextFile(path);
    const lines = text.split("\n");
    lines.splice(beginLine, endLine - beginLine, content);
    await Deno.writeTextFile(path, lines.join("\n"));
    return "success";
  },
  append: async (
    { path, content }: z.infer<typeof modifySchema.append>,
  ): Promise<Result> => {
    const file = await Deno.open(path, { write: true, append: true });
    await file.write(new TextEncoder().encode(content));
    file.close();
    return "success";
  },
  remove: async (
    { path }: z.infer<typeof modifySchema.remove>,
  ): Promise<Result> => {
    await Deno.remove(path);
    return "success";
  },
  rename: async (
    { path, newPath }: z.infer<typeof modifySchema.rename>,
  ): Promise<Result> => {
    await Deno.rename(path, newPath);
    return "success";
  },
};

type ModifyInput = z.infer<typeof modifyInput>;

const DRY_RUN_LIST: ModifyInput[] = [];

function reserve(input: ModifyInput) {
  DRY_RUN_LIST.push(input);
}
type TextFileOption = {
  dryrun: boolean;
};

const dryrunnable = <Input extends ModifyInput["value"]>(
  name: keyof typeof modifySchema,
  func: (input: Input) => Promise<Result>,
  options: { dryrun: boolean },
) => {
  return async (input: Input): Promise<Result> => {
    if (options.dryrun) {
      reserve({ type: name, value: input });
      return await "reserved";
    }
    return await func(input);
  };
};

// addLineNumbers関数は、与えられたテキストに行番号を追加します。テキストは文字列として与えられ、改行文字で分割されます。各行には、行番号とその行の内容が含まれます。行番号は、1から始まります。
function addLineNumbers(text: string): string {
  const lines = text.split("\n");
  const len = lines.length;
  const keta = Math.floor(Math.log10(len)) + 1;

  const pad = (n: number) => {
    return String(n).padStart(keta, "0");
  };
  return lines.map((line, i) => `${pad(i + 1)}: ${line}`).join("\n");
}

async function cat(path: string): Promise<string> {
  const text = await Deno.readTextFile(path);
  const header = `File:${path}\n`;
  return header + addLineNumbers(text);
}

export const textfile = (options?: TextFileOption) => {
  const read = cogito.func("textfile_read", {
    description: "Read text file",
    input: z.object({ path: z.string() }),
    output: z.string(),
    callback: async ({ path }) => {
      return await cat(path);
    },
  });

  const create = cogito.func("textfile_create", {
    description: "Create Text File",
    input: modifySchema.create,
    output: result,
    callback: dryrunnable("create", modifyCallbacks.create, options),
  });

  const insert = cogito.func("textfile_insert", {
    description: "Insert Text File",
    input: modifySchema.insert,
    output: result,
    callback: modifyCallbacks.insert,
  });

  const replace = cogito.func("textfile_replace", {
    description: "Replace Text File",
    input: modifySchema.replace,
    output: result,
    callback: modifyCallbacks.replace,
  });

  const append = cogito.func("textfile_append", {
    description: "Append Text File",
    input: modifySchema.append,
    output: result,
    callback: modifyCallbacks.append,
  });

  const remove = cogito.func("textfile_remove", {
    description: "Delete Text File",
    input: modifySchema.remove,
    output: result,
    callback: modifyCallbacks.remove,
  });

  const rename = cogito.func("textfile_rename", {
    description: "Rename Text File",
    input: modifySchema.rename,
    output: result,
    callback: modifyCallbacks.rename,
  });

  return {
    read,
    create,
    append,
    insert,
    replace,
    remove,
    rename,
  };
};
