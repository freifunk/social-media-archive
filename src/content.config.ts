// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
// Define a `loader` and `schema` for each collection
const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/blog" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }),
      tags: z.array(z.string())
    })
});


const tweets = defineCollection({
  schema: z.object({
    id: z.number(),
    username: z.string(),
    tweetID: z.string(),
    conversationID: z.string(),
    createdAt: z.string().datetime(), // or z.date() if you want to parse it
    likeCount: z.number(),
    quoteCount: z.number(),
    replyCount: z.number(),
    retweetCount: z.number(),
    isLiked: z.number(),
    isRetweeted: z.number(),
    path: z.string(),
    addedToDatabaseAt: z.string(),
    archivedAt: z.string(),
    deletedAt: z.string().nullable(),
    isBookmarked: z.number(),
    deletedTweetAt: z.string().nullable(),
    deletedRetweetAt: z.string().nullable(),
    deletedLikeAt: z.string().nullable(),
    deletedBookmarkAt: z.string().nullable()
  })
});



// Export a single `collections` object to register your collection(s)
export const collections = { blog, tweets };