import * as cheerio from "cheerio";
import { type NextRequest, NextResponse } from "next/server";

// Helper to clean text
const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

// Helper to parse numbers (e.g., "1.2k" -> 1200)
const _parseMetric = (str: string): number => {
  if (!str) return 0;
  const lower = str.toLowerCase().replace(/,/g, "");
  if (lower.includes("k")) return parseFloat(lower) * 1000;
  if (lower.includes("m")) return parseFloat(lower) * 1000000;
  return parseInt(lower.replace(/[^0-9]/g, ""), 10) || 0;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    const result = {
      text: "",
      author: {
        name: "",
        handle: "",
        avatar: "",
      },
      stats: {
        likes: 0,
        replies: 0,
        shares: 0,
      },
      platform: "twitter" as
        | "twitter"
        | "linkedin"
        | "instagram"
        | "tiktok"
        | "facebook", // Default or detected
      image: "",
    };

    // User-Agent spoofing to try and pass basic WAFs
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // --- Platform Detection & Specific Logic ---

    // 1. Reddit (JSON API is reliable)
    if (domain.includes("reddit.com")) {
      try {
        const jsonUrl = `${url.split("?")[0].replace(/\/$/, "")}.json`;
        const res = await fetch(jsonUrl, {
          headers: { "User-Agent": "Subbox/1.0" },
        });

        if (res.ok) {
          const data = await res.json();
          const post = data[0]?.data?.children?.[0]?.data;

          result.platform = "twitter"; // Map Reddit to Twitter-like theme for now, or could add 'reddit' if supported
          result.text =
            post?.title + (post?.selftext ? `\n\n${post.selftext}` : "");
          result.author.name = `u/${post?.author}`;
          result.author.handle = `@${post?.subreddit}`;
          result.stats.likes = post?.ups || 0;
          result.stats.replies = post?.num_comments || 0;
          // Reddit doesn't strictly have "shares" in the public API same way

          if (post?.thumbnail?.startsWith("http")) {
            result.image = post.thumbnail;
          }

          return NextResponse.json(result);
        }
      } catch (e) {
        console.error("Reddit fetch failed", e);
      }
    }

    // 2. Generic Fetch for others
    try {
      const response = await fetch(url, { headers });
      const html = await response.text();
      const $ = cheerio.load(html);

      // Common OG Tags
      const ogTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        "";
      const ogDesc =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";
      const ogImage = $('meta[property="og:image"]').attr("content") || "";
      const ogSiteName =
        $('meta[property="og:site_name"]').attr("content") || "";

      // Default fill
      result.text = ogDesc;
      result.image = ogImage;

      // Platform Specifics

      // --- Twitter / X ---
      if (domain.includes("twitter.com") || domain.includes("x.com")) {
        result.platform = "twitter";
        // Twitter OG title often: "Name (@handle) on X"
        // Twitter OG desc: "Post content"

        // Attempt to parse Title for Author
        const titleMatch = ogTitle.match(/^(.*?) \(@(.*?)\)/);
        if (titleMatch) {
          result.author.name = titleMatch[1];
          result.author.handle = `@${titleMatch[2]}`;
        } else {
          // Fallback attempt: "Name on X: ..."
          const altMatch = ogTitle.match(/^(.*?) on (Twitter|X):/);
          if (altMatch) {
            result.author.name = altMatch[1];
          }
        }

        // Cleanup text (remove quotes often added by X)
        if (result.text.startsWith("“") && result.text.endsWith("”")) {
          result.text = result.text.slice(1, -1);
        }

        // Remove redundant author info from start of text
        // e.g. "Name (@handle) on X: ..."
        if (result.author.name && result.text.includes(result.author.name)) {
          const authorPrefix = new RegExp(
            `^${result.author.name}.*?on (X|Twitter|LinkedIn|Instagram|Facebook):\\s*`,
            "i",
          );
          result.text = result.text.replace(authorPrefix, "");
        }

        // Additional cleanup for redundant quotes/whitespace
        result.text = cleanText(result.text).replace(/^["']|["']$/g, "");

        // Attempt to find avatar (Twitter often puts it in meta image if it's a text post, OR explicitly in other tags)
        // Sometimes twitter:image is the profile pic for text-only tweets
        const twitterImage = $('meta[name="twitter:image"]').attr("content");
        if (twitterImage) result.author.avatar = twitterImage;

        // Stats are hard to scrape from HTML due to React, but sometimes in description?
        // "100 Likes, 20 Comments" - rare in modern X og:description
      }

      // --- LinkedIn ---
      else if (domain.includes("linkedin.com")) {
        result.platform = "linkedin";
        // LinkedIn OG Title: "Name on LinkedIn: Post title/snippet"

        const nameMatch = ogTitle.split(" on LinkedIn:")[0];
        if (nameMatch) {
          result.author.name = nameMatch;
          result.author.handle = `@${nameMatch.replace(/\s+/g, "").toLowerCase()}`; // Fake handle
        }

        // LinkedIn description often works well for text
      }

      // --- Instagram ---
      else if (domain.includes("instagram.com")) {
        result.platform = "instagram";
        // OG Title: "User (@handle) on Instagram: 'Caption...'"

        const instaMatch = ogTitle.match(/^(.*?) \(@(.*?)\) on Instagram/);
        if (instaMatch) {
          result.author.name = instaMatch[1];
          result.author.handle = `@${instaMatch[2]}`;

          // Extract caption from title if description is generic?
          // Often description is better.
          // Sometimes title has the caption in quotes
          const captionMatch = ogTitle.match(/: "(.*?)"$/);
          if (captionMatch) {
            result.text = captionMatch[1];
          }
        }

        // Instagram often blocks heavily, so OG tags might be generic "Login • Instagram"
        if (ogTitle.includes("Login")) {
          result.text = "Login required to view this Instagram post.";
        }
      }

      // --- Facebook ---
      else if (domain.includes("facebook.com")) {
        // Facebook is mapped to linkedin (similar card style) or generic
        result.platform = "linkedin"; // Fallback mapping as we don't have 'facebook' theme yet

        // OG Title often: "Name - Post content | Facebook"
        const titleParts = ogTitle.split(" - ");
        if (titleParts.length > 0) {
          result.author.name = titleParts[0];
          result.author.handle = `@${titleParts[0].replace(/\s+/g, "")}`;
        }

        // Description usually holds the post text
      }

      // --- General Fallback Logic ---
      if (!result.text) result.text = ogTitle;
      if (!result.author.name) result.author.name = ogSiteName || domain;
      if (!result.author.avatar && ogImage) {
        // Use OG image as avatar if no specific profile pic found?
        // Often OG image IS the content image.
        // For text posts, sometimes it is the author.
        // Let's populate image as content image primarily, but we can return it.
      }
    } catch (e) {
      console.error("Scrape failed", e);
      // Fallback to minimal
      result.text = url;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unfurl error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 },
    );
  }
}
