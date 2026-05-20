# LLM Primer

A bilingual, multi-tier, community-driven knowledge base for LLM principles and papers.

> [**中文文档**](./README.zh-CN.md) | [**English Documentation**](https://llm-primer.pages.dev/en/)

## Overview

Learn large language models from intuition to research through interactive demos, engineering insights, and curated papers.

### Content Modules

- **Foundations** — Tokenization, Attention, Transformer, Sampling & Decoding, Positional Encoding, Embeddings, Emergent Abilities
- **Training** — Pretraining & Scaling Laws, Fine-Tuning & Alignment (SFT, RLHF, DPO)
- **Inference** — KV Cache & Quantization, Efficient Attention, Long Context
- **Applications** — RAG & Retrieval Augmentation, Agents & Tool Use, Prompt Engineering, Evaluation & Benchmarks, Safety & Security

### Paper Library

80+ curated LLM papers with bilingual TLDRs. Each paper entry links back to the articles that cite it.

### Key Features

- **Three reading tiers**: Intuitive (mental models), Engineering (implementation trade-offs), Research (papers and open questions)
- **Bilingual**: Full Chinese and English content
- **Interactive demos**: Tokenizer visualization, attention heatmap, sampling playground
- **Paper-driven**: Key claims trace back to curated papers; unreviewed candidates stay in inbox

## Local Development

Requirements: Node 20 and pnpm 9.

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # build to dist/
pnpm test       # run tests
pnpm lint:content  # validate article frontmatter and paper refs
```

## Deployment

Deployed to Cloudflare Pages. See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) for CI/CD configuration.
