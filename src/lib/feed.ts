import { getCollection, type CollectionEntry } from 'astro:content';

export const FEED_TITLE = 'wadakatu Blog';
export const FEED_DESCRIPTION =
  'Tech articles and learnings by wadakatu - Laravel, TypeScript, and web development.';
export const FEED_AUTHOR = 'wadakatu';
export const FEED_IMAGE = 'https://www.wadakatu.dev/images/logo-400.webp';
export const FEED_LIMIT = 20;

export type FeedPost = CollectionEntry<'blog'>;

export function postSlug(post: FeedPost): string {
  return post.id.replace(/\.md$/, '');
}

export function postUrl(post: FeedPost, site: string): string {
  return `${site.replace(/\/$/, '')}/blog/${postSlug(post)}/`;
}

export function categoryOf(type: FeedPost['data']['type']): string {
  return type === 'tech' ? 'Tech' : 'Life';
}

export async function publishedPosts(): Promise<FeedPost[]> {
  const posts = await getCollection('blog', ({ data }) => data.published === true && data.published_at != null);
  return posts.sort((a, b) => {
    const at = a.data.published_at?.getTime() ?? 0;
    const bt = b.data.published_at?.getTime() ?? 0;
    return bt - at;
  });
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date: Date): string {
  return date.toUTCString();
}

export function rssXml(posts: FeedPost[], site: string, now: Date = new Date()): string {
  const origin = site.replace(/\/$/, '');
  const items = posts.slice(0, FEED_LIMIT).map((post) => {
    const url = postUrl(post, origin);
    const title = `${post.data.emoji} ${post.data.title}`;
    const published = post.data.published_at!;
    const categories = [categoryOf(post.data.type), ...post.data.topics]
      .map((c) => `      <category>${escapeXml(c)}</category>`)
      .join('\n');
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(published)}</pubDate>
${categories}
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${origin}/blog/</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>ja</language>
    <copyright>Copyright ${now.getFullYear()} ${FEED_AUTHOR}</copyright>
    <lastBuildDate>${rfc822(now)}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${FEED_IMAGE}</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${origin}/blog/</link>
    </image>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`;
}

export function atomXml(posts: FeedPost[], site: string, now: Date = new Date()): string {
  const origin = site.replace(/\/$/, '');
  const latest = posts[0]?.data.updated_at ?? posts[0]?.data.published_at ?? now;
  const entries = posts.slice(0, FEED_LIMIT).map((post) => {
    const url = postUrl(post, origin);
    const title = `${post.data.emoji} ${post.data.title}`;
    const published = post.data.published_at!;
    const updated = post.data.updated_at ?? published;
    const categories = [categoryOf(post.data.type), ...post.data.topics]
      .map((c) => `    <category term="${escapeXml(c)}"/>`)
      .join('\n');
    return `  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${escapeXml(url)}" rel="alternate" type="text/html"/>
    <id>${escapeXml(url)}</id>
    <published>${published.toISOString()}</published>
    <updated>${updated.toISOString()}</updated>
    <author>
      <name>${FEED_AUTHOR}</name>
      <uri>${origin}</uri>
    </author>
${categories}
  </entry>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>${escapeXml(FEED_DESCRIPTION)}</subtitle>
  <link href="${origin}/blog/" rel="alternate" type="text/html"/>
  <link href="${origin}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${origin}/blog/</id>
  <updated>${latest.toISOString()}</updated>
  <author>
    <name>${FEED_AUTHOR}</name>
    <uri>${origin}</uri>
  </author>
  <rights>Copyright ${now.getFullYear()} ${FEED_AUTHOR}</rights>
  <icon>${FEED_IMAGE}</icon>
  <logo>${FEED_IMAGE}</logo>
${entries.join('\n')}
</feed>
`;
}
