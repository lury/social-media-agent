# Detailed Feature List

This README contains a list of small features/logic flows which play a small, yet significate role in how the agents in the Social Media Agent work.

Each feature is nested under the graph it belongs to. If it does not belong to a graph, it will be under the `shared` section.

## Key

- [`generate_post`](#generate-post)

## Generate Post

### Key

- [Stored URLs](#stored-urls)

### Stored URLs

Once a run reaches the `humanNode`, all of the URLs inside the `relevantLinks` and `links` state fields will be stored in the LangGraph store. This is then referenced after the `verifyLinksSubGraph` executes, to see if any of the URLs (`relevantLinks` and `links`) have already been used in previous posts.

If _any_ of the URLs exist in the store, it will route the graph to the `END` node, and not generate a post.

This is implemented to ensure duplicated content is not generated.
