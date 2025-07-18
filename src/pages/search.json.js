import { getCollection } from "astro:content";

async function getTweets(){
      const allTweets = await getCollection("tweets"); // or however you fetch tweets
      console.log("Fetched Tweets:", allTweets[1]);
      return allTweets.map((tweet) => {
        return {
          slug: tweet.slug,
          url: tweet.url,
          content: tweet.body,
          date: tweet.data.pubDate,
          username: tweet.data.username, // Assuming username is stored in data
        };
      });
}


export async function GET() {
    return new Response(JSON.stringify(await getTweets())
    , {
    status: 200,
    headers: {
              'Content-Type': 'application/json',
         }   
    })
}