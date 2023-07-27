import { cogito, z } from "./core.ts";

const Result = z.enum(["success", "failure"]);

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
  input: z.object({ path: z.string(), content: z.string() }),
  output: z.enum(["success", "failure"]),
  callback: async ({ path, content }) => {
    await Deno.writeTextFile(path, content);
    return "success";
  },
});

const edit = cogito.func("textfile_edit", {
  description: "Edit Text File",
  input: z.object({ path: z.string(), content: z.string() }),
  output: Result,
  callback: async ({ path, content }) => {
    await Deno.writeTextFile(path, content);
    return "success";
  },
});

const append = cogito.func("textfile_append", {
  description: "Append Text File",
  input: z.object({ path: z.string(), content: z.string() }),
  output: Result,
  callback: async ({ path, content }) => {
    const file = await Deno.open(path, { write: true, append: true });
    await file.write(new TextEncoder().encode(content));
    file.close();
    return "success";
  },
});

const remove = cogito.func("textfile_remove", {
  description: "Delete Text File",
  input: z.object({ path: z.string() }),
  output: Result,
  callback: async ({ path }) => {
    await Deno.remove(path);
    return "success";
  },
});

const rename = cogito.func("textfile_rename", {
  description: "Rename Text File",
  input: z.object({ path: z.string(), newPath: z.string() }),
  output: Result,
  callback: async ({ path, newPath }) => {
    await Deno.rename(path, newPath);
    return "success";
  },
});

export const textfile = {
  read,
  create,
  append,
  edit,
  remove,
  rename,
};

/*
const read = cogito.func("textfile_read", {
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return "" + path;
    //return await cat(await Deno.readTextFile(path));
  },
});
/*
const create = cogito.func("textfile_create", {
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return await Deno.readTextFile(path);
  },
});

const edit = cogito.func("textfile_edit", {
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return await Deno.readTextFile(path);
  },
});

const append = cogito.func("textfile_append", {
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return await Deno.readTextFile(path);
  },
});

const delete = cogito.func("textfile_delete", {
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return await Deno.readTextFile(path);
  },
});



export const textfile = {
  read,
  create,
  append,
  edit,
  delete
};
/*
const createFile = cogito.func("createFile", {*/
