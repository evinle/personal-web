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
    noteSide: z.enum(['left']).optional(),
    detail: z.object({
      problem: z.string(),
      fix: z.string(),
      result: z.string(),
    }),
    technologies: z.array(reference('technologies')),
  }),
});

const qualifications = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/qualifications' }),
  schema: z.object({
    studied: z.object({
      degree: z.string(),
      at: z.string(),
      grade: z.string(),
    }),
    certs: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
  }),
});

const whoami = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/whoami' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    at: z.string(),
    since: z.number(),
    based: z.string(),
    status: z.string(),
  }),
});

const principles = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/principles' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    description: z.string(),
  }),
});

const contact = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/contact' }),
  schema: z.object({
    email: z.string().email(),
    github: z.string().url(),
    npm: z.string().url(),
  }),
});

const intro = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/intro' }),
});

export const collections = {
  technologies,
  stack,
  projects,
  qualifications,
  whoami,
  principles,
  contact,
  intro,
};
