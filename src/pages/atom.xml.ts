import type { APIRoute } from 'astro';
import { atomXml, publishedPosts } from '@/lib/feed';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://www.wadakatu.dev';
  const posts = await publishedPosts();
  return new Response(atomXml(posts, origin), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
