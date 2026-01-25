import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    let title = '';
    let description = '';
    let image = '';

    // Strategy: Reddit (JSON API)
    if (domain.includes('reddit.com')) {
        try {
            // Append .json to get structured data
            // Remove query params first to avoid messing up .json
            const jsonUrl = url.split('?')[0].replace(/\/$/, '') + '.json';
            
            const res = await fetch(jsonUrl, {
                headers: { 'User-Agent': 'Subbox/1.0' }
            });
            
            if (res.ok) {
                const data = await res.json();
                // data[0] is the post, data[1] is comments
                // If it's a permalink to a comment, data[1] contains the target comment chain
                
                const post = data[0]?.data?.children?.[0]?.data;
                
                title = post?.title || '';
                description = post?.selftext || ''; // Post body
                image = post?.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : '';

                // If it's a comment deep link, we might want the specific comment
                // Reddit usually puts the comment context in data[1]
                if (url.includes('/comment/')) {
                     const comment = data[1]?.data?.children?.[0]?.data;
                     if (comment?.body) {
                         description = comment.body;
                         title = `Comment by u/${comment.author}`;
                     }
                }
            }
        } catch (e) {
            console.error('Reddit fetch failed, falling back to html', e);
        }
    }

    // If specific strategies failed or skipped, use generic/enhanced HTML scraping
    if (!title && !description) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        const response = await fetch(url, { headers });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Generic Open Graph extraction
        title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        image = $('meta[property="og:image"]').attr('content') || '';

        // Platform Specific Cleanups
        
        // Twitter/X: Description often is "“Post text”" - remove quotes
        if (domain.includes('twitter.com') || domain.includes('x.com')) {
             if (description.startsWith('“') && description.endsWith('”')) {
                 description = description.slice(1, -1);
             }
             // Remove "User on X: " prefix from title
             title = title.replace(/ on X: ".*"/, '').replace(/ on Twitter: ".*"/, '');
        }

        // Trustpilot: Try to find specific review content if OG fails or is generic
        if (domain.includes('trustpilot.com')) {
            // Trustpilot pages often list many reviews. If it's a specific review link, we might need more logic.
            // But if it's a general page, OG usually points to company.
            // Let's try to grab the first review if description is generic
            const firstReview = $('p[data-service-review-text-typography="true"]').first().text();
            if (firstReview) {
                description = firstReview;
            }
        }
    }

    return NextResponse.json({
        title,
        description,
        image
    });

  } catch (error) {
    console.error('Unfurl error:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}