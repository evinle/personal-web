import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const technologies = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/technologies' }),
  schema: z.object({
    label: z.string(),
    icon: z.string().optional(),
    note: z.string().optional(),
  }),
});

const stack = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/stack' }),
  schema: z.object({
    name: z.string(),
    technologies: z.array(reference('technologies')),
  }),
});

export const collections = { technologies, stack };
