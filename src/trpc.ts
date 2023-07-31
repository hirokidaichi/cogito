import { cogito, z } from "./core.ts";
import { Func } from "./function.ts";
import { FunctionSet } from "./functionset.ts";
import * as trpc from "https://esm.sh/@trpc/server@10.36.0";
trpc
const t = trpc.initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

const toProcedure = <Input, Output>(func: Func<Input, Output>) => {
  const name = func.name;
  const input = func.input;
  const output = func.output;
  return publicProcedure.input(input).output(output).query(async (req) => {
    return await func.call(req.input);
  });
};

const add = cogito.func("add", {
  description: "add two numbers",
  input: z.object({ a: z.number(), b: z.number() }),
  output: z.number(),
  callback: ({ a, b }) => {
    return a + b;
  },
});

const router = t.router({
  add: toProcedure(add),
});

type APIRouter = typeof router;

/*
const createProcedure = (functionSet: FunctionSet) => {
  const procedures: any = {};
  for (const name of functionSet.names()) {
    const func = functionSet.get(name);
    if (func) {
      procedures[name] = publicProcedure.input(func.input).query(async(req) => {
        return await func.exec(req);
      });
    }
    return procedures;
  }


export class TRPCServer {
  constructor(public functions: FunctionSet) {
    const router = t.router(createProcedure(functions));
  }
}


/*

/*


interface Something {
  id: number;
  name: string;
}


const server= cogito.server(functionset)
server.run({})


const appRouter = router({
  helloWorld: publicProcedure.query((req) => {
    return "Hello World";
  }),
  createSomething: publicProcedure.input(z.object({ name: z.string() }))
    .mutation((req) => {
      const s = Math.random();
      const sm: Something = { id: s, name: req.input.name };
      return sm;
    }),
});

export type AppRouter = typeof appRouter;
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { fetchRequestHandler } from "npm:@trpc/server/adapters/fetch";

function handler(request: any) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    // @ts-ignore
    router: appRouter,
    createContext: () => ({}),
  });
}

serve(handler, { port: 5005 });*/
/*

const router = cogito.router(functionset)

serve(app.handler

*/
