import { Annotation } from "@langchain/langgraph";
import { DateType } from "../../../types.js";
import { IngestDataAnnotation } from "../../../ingest-data/ingest-data-state.js";
import { VerifyLinksResultAnnotation } from "../../../verify-links/verify-links-state.js";

const BaseGeneratePostAnnotation = Annotation.Root({
  /**
   * The generated post for LinkedIn/Twitter.
   */
  post: Annotation<string>,
  /**
   * The date to schedule the post for.
   */
  scheduleDate: Annotation<DateType>,
  /**
   * The image to attach to the post, and the MIME type.
   */
  image: Annotation<
    | {
        imageUrl: string;
        mimeType: string;
      }
    | undefined
  >,
  /**
   * The links to use to generate a post.
   */
  links: Annotation<string[]>,
  /**
   * The report generated on the content of the message. Used
   * as context for generating the post.
   */
  report: IngestDataAnnotation.spec.report,
  ...VerifyLinksResultAnnotation.spec,
  /**
   * The node to execute next.
   */
  next: Annotation<string | undefined>,
  /**
   * Response from the user for the post. Typically used to request
   * changes to be made to the post.
   */
  userResponse: Annotation<string | undefined>,
});

export type BaseGeneratePostState = typeof BaseGeneratePostAnnotation.State;
export type BaseGeneratePostUpdate = typeof BaseGeneratePostAnnotation.Update;
