import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

async function getInterrupts() {
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });
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

  const interrupts = await getInterrupts();

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
