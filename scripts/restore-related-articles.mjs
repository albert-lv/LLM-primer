#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

// List of all MDX files that need RelatedArticles restored
const TARGET_FILES = [
  // Chinese files
  'src/content/docs/foundations/tokenization.mdx',
  'src/content/docs/foundations/embeddings.mdx',
  'src/content/docs/foundations/attention.mdx',
  'src/content/docs/foundations/positional-encoding.mdx',
  'src/content/docs/foundations/sampling-and-decoding.mdx',
  'src/content/docs/foundations/transformer-architecture.mdx',
  'src/content/docs/foundations/why-llm-emerges.mdx',
  'src/content/docs/training/fine-tuning-and-alignment.mdx',
  'src/content/docs/training/pretraining-and-scaling.mdx',
  'src/content/docs/inference/kv-cache-and-quantization.mdx',
  'src/content/docs/inference/efficient-attention.mdx',
  'src/content/docs/inference/long-context.mdx',
  'src/content/docs/applications/code-generation.mdx',
  'src/content/docs/applications/evaluation-and-benchmarks.mdx',
  'src/content/docs/applications/agents-and-tools.mdx',
  'src/content/docs/applications/prompt-engineering.mdx',
  'src/content/docs/applications/safety-and-security.mdx',
  'src/content/docs/applications/rag-and-retrieval.mdx',
  // English files
  'src/content/docs/en/foundations/tokenization.mdx',
  'src/content/docs/en/foundations/embeddings.mdx',
  'src/content/docs/en/foundations/attention.mdx',
  'src/content/docs/en/foundations/positional-encoding.mdx',
  'src/content/docs/en/foundations/sampling-and-decoding.mdx',
  'src/content/docs/en/foundations/transformer-architecture.mdx',
  'src/content/docs/en/foundations/why-llm-emerges.mdx',
  'src/content/docs/en/training/fine-tuning-and-alignment.mdx',
  'src/content/docs/en/training/pretraining-and-scaling.mdx',
  'src/content/docs/en/inference/kv-cache-and-quantization.mdx',
  'src/content/docs/en/inference/efficient-attention.mdx',
  'src/content/docs/en/inference/long-context.mdx',
  'src/content/docs/en/applications/code-generation.mdx',
  'src/content/docs/en/applications/evaluation-and-benchmarks.mdx',
  'src/content/docs/en/applications/agents-and-tools.mdx',
  'src/content/docs/en/applications/prompt-engineering.mdx',
  'src/content/docs/en/applications/safety-and-security.mdx',
  'src/content/docs/en/applications/rag-and-retrieval.mdx',
];

async function main() {
  let updated = 0;
  let skipped = 0;

  for (const filePath of TARGET_FILES) {
    try {
      let content = await readFile(filePath, 'utf8');

      // Check if already has RelatedArticles component
      if (content.includes('<RelatedArticles')) {
        console.log(`⊘ ${filePath} - already has RelatedArticles`);
        skipped++;
        continue;
      }

      // Calculate current slug from file path
      let currentSlug = filePath
        .replace('src/content/docs/', '')
        .replace('.mdx', '');

      // Remove leading 'en/' for consistent slug format
      if (currentSlug.startsWith('en/')) {
        currentSlug = currentSlug.replace('en/', '');
      }

      // Find where to insert: before <PaperList or at the end
      const paperListMatch = content.match(/\n<PaperList/);

      let newContent;
      if (paperListMatch) {
        // Insert before <PaperList
        const insertPos = content.indexOf('\n<PaperList');
        newContent = content.slice(0, insertPos) +
          `\n<RelatedArticles related={frontmatter.related} currentSlug="${currentSlug}" />\n` +
          content.slice(insertPos);
      } else {
        // Append at the end
        newContent = content.trimEnd() +
          `\n\n<RelatedArticles related={frontmatter.related} currentSlug="${currentSlug}" />\n`;
      }

      await writeFile(filePath, newContent);
      console.log(`✓ ${filePath}`);
      updated++;
    } catch (e) {
      console.error(`✗ ${filePath}: ${e.message}`);
    }
  }

  console.log(`\nTotal updated: ${updated}, skipped: ${skipped}`);
}

main().catch(console.error);
