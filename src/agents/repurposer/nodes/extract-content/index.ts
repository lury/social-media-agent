import { RepurposerState } from "../../types.js";
import { extractOriginalPostContent } from "./original-content.js";

export async function extractContent(
  state: RepurposerState,
): Promise<Partial<RepurposerState>> {
  const originalContent = await extractOriginalPostContent(state.originalLink);
}
