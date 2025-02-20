import { Annotation } from "@langchain/langgraph";
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

export const RepurposerGraphAnnotation = Annotation.Root({
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
  /**
   * The report generated on the content of the message. Used
   * as context for generating the post.
   */
  report: IngestDataAnnotation.spec.report,
  /**
   * The generated posts for LinkedIn/Twitter.
   */
  posts: Annotation<RepurposedPost[]>,
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
