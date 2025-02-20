import { RepurposerState } from "../types.js";

export async function schedulePosts(
  state: RepurposerState,
): Promise<Partial<RepurposerState>> {
  console.log("Scheduling posts");
  console.dir(state, { depth: null });
  return {};
}
