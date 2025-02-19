import { VerifyTweetAnnotation } from "../verify-tweet-state.js";
import { extractTweetId, imageUrlToBuffer } from "../../utils.js";
import { TwitterClient } from "../../../clients/twitter/client.js";
import { resolveAndReplaceTweetTextLinks } from "../../../clients/twitter/utils.js";
import { TweetV2, TweetV2SingleResult } from "twitter-api-v2";
import { shouldExcludeTweetContent } from "../../should-exclude.js";

async function getTwitterClient(): Promise<TwitterClient> {
  const useArcadeAuth = process.env.USE_ARCADE_AUTH;
  const useTwitterApiOnly = process.env.USE_TWITTER_API_ONLY;

  if (useTwitterApiOnly === "true" || useArcadeAuth !== "true") {
    return TwitterClient.fromBasicTwitterAuth();
  } else {
    const twitterUserId = process.env.TWITTER_USER_ID;
    if (!twitterUserId) {
      throw new Error("Twitter user ID not found in configurable fields.");
    }

    const twitterToken = process.env.TWITTER_USER_TOKEN;
    const twitterTokenSecret = process.env.TWITTER_USER_TOKEN_SECRET;

    return TwitterClient.fromArcade(twitterUserId, {
      twitterToken,
      twitterTokenSecret,
    });
  }
}

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

function getFullTweetText(
  parentTweet: TweetV2SingleResult,
  threadReplies: TweetV2[],
): string {
  let tweetContentText = "";

  if (parentTweet.data.note_tweet?.text) {
    tweetContentText = parentTweet.data.note_tweet.text;
  } else {
    tweetContentText = parentTweet.data.text;
  }

  threadReplies.forEach((r) => {
    if (r.note_tweet?.text?.length) {
      tweetContentText += `\n${r.note_tweet.text}`;
    } else if (r.text?.length) {
      tweetContentText += `\n${r.text}`;
    }
  });

  return tweetContentText;
}

export async function getTweetContent(
  state: typeof VerifyTweetAnnotation.State,
) {
  console.log("\n\nGetting tweet content for link:", state.link, "\n\n");
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
  const tweetContentText = getFullTweetText(tweetContent, threadReplies);

  const { content, externalUrls } =
    await resolveAndReplaceTweetTextLinks(tweetContentText);

  console.log("Returned external URLs:", externalUrls);
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
