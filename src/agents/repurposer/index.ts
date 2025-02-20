import { END, START, StateGraph } from "@langchain/langgraph";
import {
  RepurposerGraphAnnotation,
  RepurposerInputAnnotation,
  RepurposerState,
} from "./types.js";
import { generateReport } from "./nodes/generate-report.js";
import { extractContent } from "./nodes/extract-content/index.js";
import { generateCampaignPlan } from "./nodes/generate-campaign-plan.js";
import { generatePosts } from "./nodes/generate-posts.js";
import { humanNode } from "./nodes/human-node.js";
import { rewritePosts } from "./nodes/rewrite-posts.js";
import { schedulePosts } from "./nodes/schedule-posts.js";

function routeFromHumanNode(
  state: RepurposerState,
): "rewritePosts" | "schedulePosts" | typeof END {}

const repurposerBuilder = new StateGraph({
  stateSchema: RepurposerGraphAnnotation,
  input: RepurposerInputAnnotation,
})
  .addNode("extractContent", extractContent)
  .addNode("generateReport", generateReport)
  .addNode("generateCampaignPlan", generateCampaignPlan)
  .addNode("generatePosts", generatePosts)
  .addNode("humanNode", humanNode)
  .addNode("rewritePosts", rewritePosts)
  // .addNode("updateScheduleDate", updateScheduledDate)
  .addNode("schedulePosts", schedulePosts)

  .addEdge(START, "extractContent")
  .addEdge("extractContent", "generateReport")
  .addEdge("generateReport", "generateCampaignPlan")
  .addEdge("generateCampaignPlan", "generatePosts")
  .addEdge("generatePosts", "humanNode")
  .addConditionalEdges("humanNode", routeFromHumanNode, [
    "rewritePosts",
    "schedulePosts",
    END,
  ])
  .addEdge("rewritePosts", "humanNode")
  .addEdge("schedulePosts", END);

export const repurposerGraph = repurposerBuilder.compile();

repurposerGraph.name = "Repurposer Graph";
