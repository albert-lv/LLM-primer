import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

const TierEnum = z.enum(['intro', 'engineer', 'research']);
const ModuleEnum = z.enum(['foundations', 'training', 'inference', 'applications']);
const DomainEnum = z.enum([
  'architecture',
  'pretraining',
  'alignment',
  'inference',
  'applications',
  'evaluation',
  'safety',
  'multimodal',
  'reasoning',
  'long-context',
  'moe',
  'uncategorized',
]);

const docs = defineCollection({
  schema: docsSchema({
    extend: z.object({
      module: ModuleEnum.optional(),
      order: z.number().optional(),
      status: z.enum(['draft', 'review', 'published']).default('draft'),
      authors: z.array(z.string()).default([]),
      contributors: z.array(z.string()).default([]),
      updated: z.date().optional(),
      papers: z.array(z.string()).default([]),
      related: z.array(z.string()).default([]),
      tiers: z.array(TierEnum).default(['intro']),
    }),
  }),
});

const papers = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    arxiv_id: z.string().optional(),
    doi: z.string().optional(),
    source_url: z.string().url().optional(),
    title: z.string().optional(),
    year: z.number().int().optional(),
    authors: z.array(z.string()).optional(),
    tldr_zh: z.string().min(20).max(800),
    tldr_en: z.string().min(20).max(800),
    tags: z.array(z.string()).default([]),
    modules: z.array(ModuleEnum).default([]),
    domains: z.array(DomainEnum).default([]),
    inbox: z.boolean().default(false),
  }),
});

export const collections = { docs, papers };
