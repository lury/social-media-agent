import { RepurposerState } from "../../types.js";
import { getUrlContents } from "./get-url-contents.js";

export async function extractContent(
  state: RepurposerState,
): Promise<Partial<RepurposerState>> {
  const originalContent = await getUrlContents(state.originalLink);

  const additionalContextPromises = state.contextLinks.map(async (link) => ({
    content: await getUrlContents(link),
    link,
  }));
  const additionalContexts = await Promise.all(additionalContextPromises);

  return {
    originalContent,
    additionalContexts,
  };
}
