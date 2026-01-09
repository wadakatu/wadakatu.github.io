import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    emoji: z.string(),
    type: z.enum(['tech', 'idea']),
    topics: z.array(z.string()),
    published: z.boolean(),
    published_at: z
      .string()
      .optional()
      .transform((str) =>
        str ? new Date(str.replace(' ', 'T') + ':00') : undefined
      ),
    updated_at: z
      .string()
      .optional()
      .transform((str) =>
        str ? new Date(str.replace(' ', 'T') + ':00') : undefined
      ),
    publication_name: z.string().optional(),
  }),
});

export const collections = { blog };
