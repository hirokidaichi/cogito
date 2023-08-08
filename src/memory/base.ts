import { cogito, z } from "../core.ts";

const MemoryAddRequest = z.object({});
const MemoryAddResponse = z.object({});

const MemorySearchRequest = z.object({});
const MemorySearchResponse = z.object({});

type MemoryAddRequest = z.infer<typeof MemoryAddRequest>;
type MemoryAddResponse = z.infer<typeof MemoryAddResponse>;
type MemorySearchRequest = z.infer<typeof MemorySearchRequest>;
type MemorySearchResponse = z.infer<typeof MemorySearchResponse>;

type MemoryAdd = (request: MemoryAddRequest) => Promise<MemoryAddResponse>;
type MemorySearch = (
  request: MemorySearchRequest,
) => Promise<MemorySearchResponse>;

const createMemoryAdd = (callback: MemoryAdd) => {
  return cogito.func("memory-add", {
    description: "add memory",
    input: MemoryAddRequest,
    output: MemoryAddResponse,
    callback,
  });
};

const createMemorySearch = (callback: MemorySearch) => {
  return cogito.func("memory-search", {
    description: "search memory",
    input: MemorySearchRequest,
    output: MemorySearchResponse,
    callback,
  });
};

export const abstractMemory = (
  handler: { add: MemoryAdd; search: MemorySearch },
) => {
  return {
    add: createMemoryAdd(handler.add),
    search: createMemorySearch(handler.search),
  };
};
