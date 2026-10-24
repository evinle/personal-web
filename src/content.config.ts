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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    start: z.string(),
    end: z.string().optional(),
    tone: z.enum(['blue', 'mint']),
    note: z.string(),
    detail: z.object({
      problem: z.string(),
      fix: z.string(),
      result: z.string(),
    }),
    technologies: z.array(reference('technologies')),
  }),
});

export const collections = { technologies, stack, projects };
