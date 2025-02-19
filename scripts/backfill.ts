import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

/**
 * Performs a manual data backfill operation using LangGraph.
 *
 * This function creates a new thread and initiates a data ingestion run
 * to backfill historical data. It's useful for one-time data imports
 * or catching up on missed data ingestion periods.
 *
 * The default configuration looks back 7 days, but this can be adjusted
 * via the `maxDaysHistory` parameter in the config.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the backfill run is created
 * @throws {Error} If there's an issue creating the thread or initiating the run
 *
 * @example
 * ```bash
 * yarn cron:backfill
 * ```
 */
export async function backfill() {
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });

  const thread = await client.threads.create();
  const res = await client.runs.create(thread.thread_id, "ingest_data", {
    config: {
      configurable: {
        slackChannelId: "ADD_SLACK_CHANNEL_ID_HERE",
        maxDaysHistory: 10, // Or change to desired number of days
      },
    },
    input: {},
  });
  console.log("Created run");
  console.log(res);
}

// backfill().catch(console.error);

/**
 * Backfill with links instead of ingesting from Slack.
 */
export async function backfillWithLinks() {
  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL,
  });

  const newLinksArr: string[] = [
    "https://twitter.com/387320120/status/1892084239367025151",
    "https://www.reddit.com/r/LangChain/comments/1iri3zh/looking_for_contributors_expanding_the_brag/",
    "https://www.youtube.com/watch?v=7GAKB21lxyg&list=PLp01ObP3udmq2quR-RfrX4zNut_t_kNot",
    "https://www.reddit.com/r/LangChain/comments/1is705t/finetuning_embeddings_for_rag/",
    "https://x.com/TRJ_0751/status/1891474766621769942",
    "https://twitter.com/1136237902034296832/status/1891533068227248219",
    "https://x.com/CopilotKit/status/1891536875648626852",
    // Add your new links here
  ];

  const { thread_id } = await client.threads.create();
  await client.runs.create(thread_id, "ingest_data", {
    input: {
      links: newLinksArr,
    },
    config: {
      configurable: {
        skipIngest: true,
      },
    },
  });
}

// backfillWithLinks().catch(console.error);
