import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

async function getInterrupts(client: Client) {
  const interrupts = await client.threads.search({
    status: "interrupted",
    limit: 1000,
  });
  return interrupts;
}

export async function redoInterrupts() {
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });

  const interrupts = await getInterrupts(client);

  for await (const item of interrupts) {
    const values = item.values as Record<string, any>;

    await client.runs.create(item.thread_id, "generate_post", {
      command: {
        update: {
          ...values,
        },
        goto: "humanNode",
      },
    });
  }
}

// redoInterrupts().catch(console.error);

export async function getAllRuns() {
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });
  const threads = await client.threads.search({
    status: "interrupted",
    limit: 1000,
  });
  console.log("threads", threads.length);

  for (const { thread_id } of threads) {
    const runs = await client.runs.list(thread_id);
    await Promise.all(runs.map((r) => client.runs.delete(thread_id, r.run_id)));
    await client.threads.delete(thread_id);
  }
}

// getAllRuns().catch(console.error);
