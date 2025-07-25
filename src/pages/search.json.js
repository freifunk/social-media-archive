import { getCollection } from "astro:content";

/**
 * Transforms tweet data for search indexing
 * @param {Array} tweets - Raw tweet collection
 * @returns {Array} Transformed tweets for search
 */
function transformTweetsForSearch(tweets) {
  return tweets.map((tweet) => ({
    slug: tweet.slug,
    url: tweet.url,
    content: tweet.body,
    date: tweet.data.createdAt || tweet.data.pubDate,
    username: tweet.data.username,
    title: tweet.data.title || null,
    // Include nested data structure for compatibility
    data: {
      content: tweet.body,
      username: tweet.data.username,
      pubDate: tweet.data.createdAt || tweet.data.pubDate,
      title: tweet.data.title || null
    }
  }));
}

/**
 * Fetches and prepares tweet data for search
 * @returns {Promise<Array>} Processed tweet data
 */
async function getSearchData() {
  try {
    const allTweets = await getCollection("tweets");
    console.log("Fetched tweets for search:", allTweets.length);
    
    if (allTweets.length > 0) {
      console.log("Sample tweet structure:", allTweets[0]);
    }
    
    return transformTweetsForSearch(allTweets);
  } catch (error) {
    console.error("Error fetching tweets for search:", error);
    return [];
  }
}

export async function GET() {
  try {
    const searchData = await getSearchData();
    
    return new Response(JSON.stringify(searchData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error("Error in search.json endpoint:", error);
    
    return new Response(JSON.stringify({ error: "Failed to fetch search data" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}