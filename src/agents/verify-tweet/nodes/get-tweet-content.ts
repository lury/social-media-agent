import { VerifyTweetAnnotation } from "../verify-tweet-state.js";
import { extractTweetId, imageUrlToBuffer } from "../../utils.js";
import {
  getFullThreadText,
  resolveAndReplaceTweetTextLinks,
} from "../../../clients/twitter/utils.js";
import { TweetV2, TweetV2SingleResult } from "twitter-api-v2";
import { shouldExcludeTweetContent } from "../../should-exclude.js";
import { getTwitterClient } from "../../../clients/twitter/client.js";

async function getMediaUrls(
  parentTweet: TweetV2SingleResult,
  threadReplies: TweetV2[],
): Promise<string[]> {
  const mediaUrls: string[] = [];

  if (parentTweet.includes?.media?.length) {
    const parentMediaUrls = parentTweet.includes?.media
      .filter((m) => (m.url && m.type === "photo") || m.type.includes("gif"))
      .flatMap((m) => (m.url ? [m.url] : []));
    mediaUrls.push(...parentMediaUrls);
  }

  const threadMediaKeys = threadReplies
    .flatMap((r) => r.attachments?.media_keys)
    .filter((m): m is string => !!m);
  const threadMediaUrlPromises = threadMediaKeys.map(async (k) => {
    const imgUrl = `https://pbs.twimg.com/media/${k}?format=jpg`;
    try {
      const { contentType } = await imageUrlToBuffer(imgUrl);
      if (contentType.startsWith("image/")) {
        return imgUrl;
      }
    } catch (e) {
      console.error(
        `Failed to get content type for Twitter media URL: ${imgUrl}\n`,
        e,
      );
    }

    return undefined;
  });

  const threadMediaUrls = (await Promise.all(threadMediaUrlPromises)).filter(
    (m): m is string => !!m,
  );
  mediaUrls.push(...threadMediaUrls);

  return mediaUrls;
}

export async function getTweetContent(
  state: typeof VerifyTweetAnnotation.State,
) {
  const tweetId = extractTweetId(state.link);
  if (!tweetId) {
    console.error("Failed to extract tweet ID from link:", state.link);
    return {};
  }

  const twitterClient = await getTwitterClient();

  let tweetContent: TweetV2SingleResult | undefined;

  try {
    tweetContent = await twitterClient.getTweet(tweetId);
    if (!tweetContent) {
      throw new Error("No tweet content returned from Twitter API.");
    }
  } catch (e: any) {
    console.error("Failed to get tweet content", e);
    return {};
  }

  const threadReplies: TweetV2[] = [];
  if (tweetContent.data.author_id) {
    threadReplies.push(
      ...(await twitterClient.getThreadReplies(
        tweetId,
        tweetContent.data.author_id,
      )),
    );
  }

  const mediaUrls = await getMediaUrls(tweetContent, threadReplies);
  const tweetContentText = getFullThreadText(tweetContent, threadReplies);

  const { content, externalUrls } =
    await resolveAndReplaceTweetTextLinks(tweetContentText);

  const shouldExclude = shouldExcludeTweetContent(externalUrls);
  if (shouldExclude) {
    return {};
  }

  if (!externalUrls.length) {
    return {
      tweetContent: content,
      imageOptions: mediaUrls,
    };
  }

  return {
    tweetContent: content,
    tweetContentUrls: externalUrls,
    imageOptions: mediaUrls,
  };
}
