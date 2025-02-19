import { z } from "zod";
import { ChatAnthropic } from "@langchain/anthropic";
import { GeneratePostAnnotation } from "../generate-post-state.js";
import { END } from "@langchain/langgraph";

const HIGH_QUALITY_POSTS = [
  `🚀 Advanced RAG Techniques

Discover a powerful collection of 31 production-ready RAG implementations, from basic to advanced, built with LangChain. Each technique comes with detailed documentation and practical code examples to enhance your RAG systems.

🔍 Level up your RAG game: https://github.com/NirDiamant/RAG_Techniques`,
  `📚🤖 LangChain Doc Assistant

A powerful RAG system for querying LangChain docs, built with LangGraph orchestration. Available as both a live service and reference implementation, it features source-backed answers and customizable models.

Build your own doc assistant today! 🔍
https://github.com/lucebert/langchain-doc-graph`,
  `🔒 Secure RAG with OpenFGA

Build secure RAG systems with document-level authorization using LangChain and OpenFGA. The FGARetriever implementation provides:
- Authorization layer
- Vector store integration
- RAG pipeline

👉 Learn how to implement it: https://auth0.com/blog/building-a-secure-rag-with-python-langchain-and-openfga/`,
  `🤖 🌐 WebRover 2.0: AI Web Co-Pilot

Introducing an autonomous web agent that revolutionizes online research with LangGraph. WebRover handles everything from task automation to academic research, complete with citations.

Explore this AI research companion! 🚀
https://github.com/hrithikkoduri/WebRover`,
  `📈🤖 AI Hedge Fund Agents

A trading platform where AI agents mimic legendary investors like Buffett and Ackman. Built with LangChain's multi-LLM architecture to generate trading signals - no coding needed.

🔥 Explore this trading system: https://github.com/virattt/ai-hedge-fund`,
  `🔄 LangGraph Functional API

Introducing a streamlined way to build AI agent workflows without complex graph definitions. Packed with advanced features like time travel debugging and state management, available in both Python and JavaScript.

🎥 See it in action: https://youtube.com/watch?v=1_Kkn5pYgzk`,
];

const LOW_QUALITY_POSTS = [
  `🤖🔐 Safe AI Agent Tutorial

Create AI agents that handle Safe wallet operations and smart contracts using LangChain. This open-source guide shows how to combine blockchain interactions with intelligent agents.

AI wallet agent 👉 https://github.com/5afe/safe-ai-agent-tutorial`,
  `🤖🎭 Fay: Digital Human Framework

An open-source platform connecting digital humans with LLMs for autonomous virtual assistants. Powered by LangChain's react agents, it offers offline functionality and real-time streaming capabilities.

🚀 Build your own digital human assistant: https://github.com/xszyou/Fay`,
  `🤖 Run DeepSeek-R1 Locally in Minutes

Deploy DeepSeek-R1 open-source LLM locally with Ollama and build RAG applications using LangChain's document processing and retrieval components. Supports multiple model sizes and NVIDIA NIM integration.

🔗 Check out the complete tutorial: https://dev.to/pavanbelagatti/run-deepseek-r1-locally-for-free-in-just-3-minutes-1e82`,
  `🎙️ LangChain on SWE Daily

Founding Engineer Erick Friis reveals the architecture powering LangChain's framework, exploring the future of agentic AI design and the technical foundations that make it possible.

Tune in now 🎧
https://softwareengineeringdaily.com/2025/02/11/langchain-and-agentic-ai-engineering-with-erick-friis/`,
  `🔒 🤖 Secure RAG with LangChain

Build secure RAG applications with fine-grained authorization using LangChain and OpenFGA. Featuring custom retrievers and document-level access control for complete data security.

Start building securely 🚀
https://auth0.com/blog/building-a-secure-rag-with-python-langchain-and-openfga/`,
  `🏪 AI Agent Marketplace

LM Systems introduces a revolutionary marketplace where developers can instantly integrate production-ready LangGraph agents into applications through Cursor IDE, eliminating the need to build AI capabilities from scratch.

🎥 See it in action: https://www.youtube.com/watch?v=gaXCF8BXkAM&feature=youtu.be`,
  `🎨 Flowise: Visual LLM Builder

Transform your LLM development with this open-source UI tool. Build applications visually using LangChain's JavaScript components - no coding required.

Check out this game-changing tool 🔗 https://twitter.com/1723215612137086976/status/1890286973455344079`,
];

const CHECK_RELEVANCY_PROMPT = `You're a highly skilled AI social media marketer, working on curating new content for your Twitter & LinkedIn pages.

You've written a post for the pages, but are not sure if its quality is good enough to be published on your pages (your bar for quality posts is VERY high).

<grading-criteria>
- High quality posts should be detailed, and include multiple key points.
- High quality posts should be direct, and unambiguous.
- High quality posts should be engaging, informative and have a clear call to action.
- Low quality posts will not have many key points.
- Low quality posts will will be vague, and not extremely clear as to what the post is about/offers.
- Low quality posts will likely only reference LangChain's products (LangChain, LangSmith, LangGraph, etc.) once, and not be exact about how LangChain's products aid in the making of them.
</grading-criteria>

Here are some examples of posts which have done well, and should be published:
<high-quality-posts>
{HIGH_QUALITY_POSTS}
</high-quality-posts>

Now, here are some examples of posts which are low quality and HAVE NOT done well. These should NOT be published:
<low-quality-posts>
{LOW_QUALITY_POSTS}
</low-quality-posts>

Here is the post you just wrote. Please classify it as either high quality or low quality:
<generated-post>
{POST}
</generated-post>`;

const classifyPostRelevancySchema = z.object({
  reasoning: z.string().describe("The reasoning behind your decision."),
  isLowQuality: z
    .boolean()
    .describe(
      "Whether or not the post is low quality. If true, the post will NOT be published. If false the post WILL be published.",
    ),
});

function formatExamples(
  examples: string[],
  type: "high-quality" | "low-quality",
) {
  return examples
    .map((ex, idx) => `<${type} index="${idx}">\n${ex}\n</${type}>`)
    .join("\n");
}

export async function checkRelevancy(
  state: typeof GeneratePostAnnotation.State,
): Promise<Partial<typeof GeneratePostAnnotation.State>> {
  const model = new ChatAnthropic({
    model: "claude-3-5-sonnet-latest",
    temperature: 0,
  }).bindTools(
    [
      {
        name: "classifyPostRelevancy",
        schema: classifyPostRelevancySchema,
        description: "Classify a post as either high quality or low quality.",
      },
    ],
    {
      tool_choice: "classifyPostRelevancy",
    },
  );

  const formattedPrompt = CHECK_RELEVANCY_PROMPT.replace(
    "{HIGH_QUALITY_POSTS}",
    formatExamples(HIGH_QUALITY_POSTS, "high-quality"),
  )
    .replace(
      "{LOW_QUALITY_POSTS}",
      formatExamples(LOW_QUALITY_POSTS, "low-quality"),
    )
    .replace("{POST}", state.post);

  const result = await model.invoke(formattedPrompt);

  const { isLowQuality } = result.tool_calls?.[0]?.args as z.infer<
    typeof classifyPostRelevancySchema
  >;

  if (isLowQuality) {
    return {
      next: END,
    };
  }

  return {};
}
