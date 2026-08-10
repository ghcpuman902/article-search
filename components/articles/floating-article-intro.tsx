"use client";

import {
  FloatingInsightCard,
  type FloatingInsightContent,
} from "@workspace/ui/components/floating-insight-card";

const ARTICLE_SEARCH_INSIGHT: FloatingInsightContent = {
  eyebrow: "What am I seeing?",
  title:
    "A search tool I built for a volunteer Chinese science group: it reads RSS from the sites they already trust, ranks stories with embeddings, and helps editors find fresh English articles worth translating for students",
  subtitle: "ArticleSearch",
  cardPreview:
    "I help a WeChat-run science outlet that turns English research news into Mandarin for everyday readers. The editors kept refreshing the same handful of homepages by hand, often landing on the same stories, with no quick way to see what was new or overlapping. This app pulls from the RSS feeds they already use (structured, mostly outside paywalls), caches them on the server, and ranks by embedding similarity there when you sort by relevance. I did experiment with base64-packing the vectors and searching in the browser, but server-side caching won out in the end. I added more feeds later as a demo; the point stayed the same: spot interesting science articles before anyone sits down to translate.",
  expandedMarkdown: `I built this after watching editors refresh the same few homepages again and again, hoping something good had turned up.

- 📱 **Who it's for:** a voluntary Chinese media group that translates English science articles for students and general readers; non-profit, with attribution kept on the sources.
- 🔁 **The problem:** they only had a few sites they trusted and checked them constantly; similar headlines kept piling up, and there was no single place to ask "what's new today?"
- 📡 **Why RSS:** it's the old, overlooked "markdown for machines"; structured, well supported, easy to parse, and usually not stuck behind a hard paywall.
- 🧠 **Why embeddings:** you can search by meaning and spot near-duplicates without reading every article line by line.

That editorial workflow is why the tool exists; the rest is fetch, cache, embed, search, and render.

## RSS: the part of the internet we forgot

Everyone is suddenly talking about **llms.txt** and writing markdown for models to read; RSS has been doing a version of that for decades. The feeds here are mostly the outlets the group already relied on, with a few extra categories I bolted on later to show the idea could scale. Articles are cached on the server so a return visit does not hammer every publisher on every click.

## Embeddings: server-side search, and one experiment I rolled back

Relevance sorting runs on the server today: **text-embedding-3-small** at 512 dimensions via the AI Gateway, cached in **Upstash Redis**, then ranked with cosine similarity before the page renders. Sort by date and none of that runs.

I did try pushing embeddings to the browser first. The idea was to take each vector as a raw **Float64Array**, pack the bytes, **base64-encode** the payload, decode on the client, and run cosine similarity locally so changing sort or filters would not need another server round trip. In practice the upfront transfer and sync cost outweighed the win; server-side caching was simpler and more reliable, so I reverted.

## Other bits that survived the cut

Cover thumbnails get a **halftone look in pure CSS**: layered blend modes, no canvas and no shader. You can filter by how recent something is, sort by date or relevance, and scroll long categories through a virtualized list.

## Honest limits

You only get what the **RSS feed exposes**, not full paywalled text, so translation still starts from the snippet. **AI embeddings** (via Vercel AI Gateway) run when you sort by relevance; browsing by date alone avoids that cost. I am not offering legal advice here; the intent is non-profit use with attribution, and publishers' terms still apply. A query that works well in one category can look empty in another because the thresholds are not universal.
`,
};

export const FloatingArticleIntro = () => (
  <FloatingInsightCard content={ARTICLE_SEARCH_INSIGHT} />
);
