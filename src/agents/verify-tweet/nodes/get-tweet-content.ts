import { VerifyTweetAnnotation } from "../verify-tweet-state.js";
import { extractTweetId } from "../../utils.js";
import { TwitterClient } from "../../../clients/twitter/client.js";
import { resolveAndReplaceTweetTextLinks } from "../../../clients/twitter/utils.js";
import { TweetV2SingleResult } from "twitter-api-v2";

function shouldExcludeTweet(externalUrls: string[]): boolean {
  const useLangChainPrompts = process.env.USE_LANGCHAIN_PROMPTS === "true";
  if (!useLangChainPrompts) {
    return false;
  }

  // If there are no external URLs, then we should exclude the tweet. Return true.
  return externalUrls.length === 0;
}

export async function getTweetContent(
  state: typeof VerifyTweetAnnotation.State,
) {
  const tweetId = extractTweetId(state.link);
  if (!tweetId) {
    return {};
  }

  let twitterClient: TwitterClient;
  const useArcadeAuth = process.env.USE_ARCADE_AUTH;
  const useTwitterApiOnly = process.env.USE_TWITTER_API_ONLY;

  if (useTwitterApiOnly === "true" || useArcadeAuth !== "true") {
    twitterClient = TwitterClient.fromBasicTwitterAuth();
  } else {
    const twitterUserId = process.env.TWITTER_USER_ID;
    if (!twitterUserId) {
      throw new Error("Twitter user ID not found in configurable fields.");
    }

    const twitterToken = process.env.TWITTER_USER_TOKEN;
    const twitterTokenSecret = process.env.TWITTER_USER_TOKEN_SECRET;

    twitterClient = await TwitterClient.fromArcade(twitterUserId, {
      twitterToken,
      twitterTokenSecret,
    });
  }

  let tweetContent: TweetV2SingleResult | undefined;

  try {
    tweetContent = await twitterClient.getTweet(tweetId);
  } catch (e: any) {
    console.error("Failed to get tweet content", e);
    return {};
  }

  if (!tweetContent) {
    throw new Error("Failed to get tweet content");
  }

  const mediaUrls: string[] =
    tweetContent.includes?.media
      ?.filter((m) => (m.url && m.type === "photo") || m.type.includes("gif"))
      .flatMap((m) => (m.url ? [m.url] : [])) || [];

  let tweetContentText = "";
  if (tweetContent.data.note_tweet?.text) {
    tweetContentText = tweetContent.data.note_tweet.text;
  } else {
    tweetContentText = tweetContent.data.text;
  }

  const { content, externalUrls } =
    await resolveAndReplaceTweetTextLinks(tweetContentText);

  const shouldExclude = shouldExcludeTweet(externalUrls);
  if (shouldExclude) {
    return {};
  }

  if (!externalUrls.length) {
    return {
      tweetContent: tweetContentText,
      imageOptions: mediaUrls,
    };
  }

  return {
    tweetContent: content,
    tweetContentUrls: externalUrls,
    imageOptions: mediaUrls,
  };
}
