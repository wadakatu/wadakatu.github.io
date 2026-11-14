import type { APIRoute } from 'astro';
import { publishedPosts, rssXml } from '@/lib/feed';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://www.wadakatu.dev';
  const posts = await publishedPosts();
  return new Response(rssXml(posts, origin), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
