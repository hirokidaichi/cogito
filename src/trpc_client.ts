import { AppRouter } from "./trpc.ts";
import { trpc_client } from "./deps.ts";



const client = trpc_client.createTRPCProxyClient<AppRouter>({
  links: [
    trpc_client.httpLink({
      url: "http://localhost:5005/trpc",
    }),
  ],
});

try {
  {
    const query = await client.helloWorld.query();
    console.log(JSON.stringify(query));
  }
  {
    const query = await client.createSomething.mutate({ name: "kohe" });
    console.log(JSON.stringify(query));
  }
} catch (e) {
  console.error(e);
}
