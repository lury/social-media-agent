import { RepurposerState } from "../types.js";

// const REWRITE_POSTS_PROMPT = `<context>
// You're a highly regarded marketing employee, working on crafting thoughtful and engaging content for your LinkedIn and Twitter pages.
// You wrote a thread for your LinkedIn and Twitter pages, however your boss has asked for some changes to be made before it can be published.
// You're also be provided with the original plan for the thread which you wrote.
// Use this plan to guide your decisions, however ensure you weigh the user's requests above the plan if they contradict each other.
// </context>

// <original-thread>
// {originalThread}
// </original-thread>

// {reflectionsPrompt}

// <original-thread-plan>
// {originalThreadPlan}
// </original-thread-plan>

// <instructions>
// Listen to your boss closely, and make the necessary changes to the thread.
// Ensure you keep the reflections above in mind when making the changes.
// You should ONLY update the posts which the user has requested to be updated.
// If it is not clear which posts should be updated, you should do your best to determine which posts they intend to update.
// You should respond with ALL of the posts, including updated and unchanged posts.
// </instructions>`;

export async function rewritePosts(
  state: RepurposerState,
): Promise<Partial<RepurposerState>> {
  console.log("Rewriting posts");
  console.dir(state, { depth: null });

  return {};
}
