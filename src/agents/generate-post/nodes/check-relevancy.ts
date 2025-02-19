import { CurateDataState } from "../../curate-data/state.js";

const CHECK_RELEVANCY_PROMPT = `You're a highly skilled AI social media marketer, working on curating new content for your Twitter & LinkedIn pages.

You've written a post for the pages, but are not sure if its quality is good enough to be published on your pages (your bar for quality posts is VERY high).

Here are some examples of posts which have done well, and should be published:
<high-quality-posts>
{HIGH_QUALITY_POSTS}
</high-quality-posts>

Now, here are some examples of posts which are low quality and HAVE NOT done well. These should NOT be published:
<low-quality-posts>
{LOW_QUALITY_POSTS}
</low-quality-posts>

Here is the post you just wrote. Please classify it as either high quality or low quality:
<post>
{POST}
</post>`;

export async function checkRelevancy(
  state: CurateDataState,
): Promise<Partial<CurateDataState>> {
  return {};
}
