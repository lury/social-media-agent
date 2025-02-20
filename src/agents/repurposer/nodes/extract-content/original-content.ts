import { TweetV2, TweetV2SingleResult } from "twitter-api-v2";
import { getTwitterClient } from "../../../../clients/twitter/client.js";
import { extractTweetId, getUrlType } from "../../../utils.js";
import { FireCrawlLoader } from "@langchain/community/document_loaders/web/firecrawl";
import {
  getFullThreadText,
  resolveAndReplaceTweetTextLinks,
} from "../../../../clients/twitter/utils.js";
import { getVideoSummary } from "../../../shared/youtube/video-summary.js";

async function getGeneralContent(url: string): Promise<string> {
  try {
    const loader = new FireCrawlLoader({
      url,
      mode: "scrape",
      params: {
        formats: ["markdown"],
      },
    });

    const docs = await loader.load();

    return `<webpage-content url="${url}">\n${docs[0].pageContent}\n</webpage-content>`;
  } catch (e) {
    console.log(`Failed to fetch content from ${url}.`, e);
  }

  return "";
}

async function getYouTubeContent(url: string): Promise<string> {
  try {
    const { summary } = await getVideoSummary(url);
    return `<youtube-video-summary>\n${summary}</youtube-video-summary>`;
  } catch (e) {
    console.error(`Failed to get YouTube summary for URL ${url}`, e);
  }

  return "";
}

async function getTwitterContent(url: string): Promise<string> {
  const tweetId = extractTweetId(url);
  if (!tweetId) {
    console.error("Failed to extract tweet ID from link:", url);
    return "";
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
    return "";
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

  const tweetContentText = getFullThreadText(tweetContent, threadReplies);

  const { content, externalUrls } =
    await resolveAndReplaceTweetTextLinks(tweetContentText);

  const externalUrlPromises = externalUrls.map(async (url) => {
    const type = getUrlType(url);
    if (type === "general") {
      return getGeneralContent(url);
    } else if (type === "youtube") {
      return getYouTubeContent(url);
    }
    return "";
  });
  const externalUrlsContent = await Promise.all(externalUrlPromises);

  return `<twitter-thread>
  <post>
    ${content}
  </post>
  <external-urls-content>
    ${externalUrlsContent.map((c, idx) => `<external-content index="${idx}">\n${c}\n</external-content>`).join("\n")}
  </external-urls-content>
</twitter-thread>`;
}

/**
 * Extracts the original post content. This can be either a blog post, tweet, or YouTube video.
 */
export async function extractOriginalPostContent(url: string): Promise<string> {
  const type = getUrlType(url);
  let postContent = "";
  if (type === "general") {
    postContent = await getGeneralContent(url);
  } else if (type === "youtube") {
    postContent = await getYouTubeContent(url);
  } else if (type === "twitter") {
    postContent = await getTwitterContent(url);
  }
  return postContent;
}
