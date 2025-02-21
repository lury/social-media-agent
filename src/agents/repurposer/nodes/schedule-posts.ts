import { Client } from "@langchain/langgraph-sdk";
import { RepurposerState } from "../types.js";
import { getScheduledDateSeconds } from "../../../utils/schedule-date/index.js";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

export async function schedulePosts(
  state: RepurposerState,
  config: LangGraphRunnableConfig,
): Promise<Partial<RepurposerState>> {
  if (!state.scheduleDate) {
    throw new Error("No schedule date found");
  }

  const client = new Client({
    apiUrl: `http://localhost:${process.env.PORT}`,
  });

  const afterSeconds = await getScheduledDateSeconds(
    state.scheduleDate,
    config,
  );

  throw new Error(`${client.toString()}${afterSeconds}`);
}
