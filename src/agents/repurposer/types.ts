import { Annotation, END } from "@langchain/langgraph";
import { IngestDataAnnotation } from "../ingest-data/ingest-data-state.js";

type RepurposedPost = {
  /**
   * The content of the specific post.
   */
  content: string;
  /**
   * The index of the post in the series.
   */
  index: number;
};

type AdditionalContext = {
  /**
   * The string content from the link.
   */
  content: string;
  /**
   * The link from which the content was extracted.
   */
  link: string;
};

export const RepurposerGraphAnnotation = Annotation.Root({
  /**
   * The link to the original post/content the new campaign is based on.
   */
  originalLink: Annotation<string>,
  /**
   * The original content input as a string. Contains all extracted/scraped
   * content from the original link.
   */
  originalContent: Annotation<string>,
  /**
   * The links to use to generate a series of posts.
   */
  contextLinks: Annotation<string[]>,
  /**
   * The additional context to use for generating posts.
   */
  additionalContexts: Annotation<AdditionalContext[]>,
  /**
   * The pageContents field is required as it's the input to the generateReportGraph.
   * It will contain a string, combining the above originalContent and additionalContexts.
   */
  pageContents: Annotation<string[]>,
  /**
   * The quality level of the content. This dictates how many posts
   * to generate.
   * Should be 1-4.
   */
  quality: Annotation<number>,
  /**
   * The report generated on the content of the message. Used
   * as context for generating the post.
   */
  reports: Annotation<
    Array<{
      report: string;
      keyDetails: string;
    }>
  >({
    reducer: (state, update) => state.concat(update),
    default: () => [],
  }),
  /**
   * The generated campaign plan to generate posts from.
   */
  campaignPlan: Annotation<string>,
  /**
   * The generated posts for LinkedIn/Twitter.
   */
  posts: Annotation<RepurposedPost[]>,
  /**
   * A human response if the user submitted feedback after the interrupt.
   */
  humanResponse: Annotation<string | undefined>(),
  /**
   * The next node to execute.
   */
  next: Annotation<"rewritePosts" | "schedulePosts" | typeof END>(),
});

export type RepurposerState = typeof RepurposerGraphAnnotation.State;

export const RepurposerInputAnnotation = Annotation.Root({
  /**
   * The link to the original post/content the new campaign is based on.
   */
  originalLink: Annotation<string>,
  /**
   * The links to use to generate a series of posts.
   */
  contextLinks: Annotation<string[]>,
  /**
   * The quality level of the content. This dictates how many posts
   * to generate.
   * Should be 1-4.
   */
  quality: Annotation<number>,
});
