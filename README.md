# LLM Primer

[![CI](https://github.com/albert-lv/LLM-primer/actions/workflows/ci.yml/badge.svg)](https://github.com/albert-lv/LLM-primer/actions/workflows/ci.yml)
[![Deploy](https://github.com/albert-lv/LLM-primer/actions/workflows/deploy.yml/badge.svg)](https://github.com/albert-lv/LLM-primer/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE.svg)](https://astro.build)
[![Starlight](https://img.shields.io/badge/docs-Starlight-5440D8.svg)](https://starlight.astro.build)

A bilingual, multi-tier, community-driven knowledge base for **Large Language Model (LLM) principles, papers, and interactive demos**. Designed to take learners from intuition to implementation to research.

> [**中文文档**](./README.zh-CN.md) · [**在线阅读 / Read Online**](https://llm-primer.pages.dev)

## What You Will Learn

- **Foundations** — Tokenization, Attention, Transformer, Sampling & Decoding, Positional Encoding, Embeddings, Emergent Abilities
- **Training** — Pretraining & Scaling Laws, Fine-Tuning & Alignment (SFT, RLHF, DPO)
- **Inference** — KV Cache & Quantization, Efficient Attention, Long Context
- **Applications** — RAG & Retrieval Augmentation, Agents & Tool Use, Prompt Engineering, Evaluation & Benchmarks, Safety & Security

## Highlights

- **Three reading tiers**: Intuitive mental models, Engineering trade-offs, Research papers and open questions
- **Bilingual**: Full Chinese and English content
- **Interactive demos**: Tokenizer visualization, attention heatmap, sampling playground
- **Paper-driven**: 80+ curated papers with bilingual TLDRs; key claims trace back to paper entries
- **Community curated**: Contributions welcome via issues and pull requests

## Local Development

Requirements: **Node 20** and **pnpm 9**.

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # build to dist/
pnpm test       # run tests
pnpm lint:content  # validate article frontmatter and paper refs
```

## Deployment

The site is deployed to [Cloudflare Pages](https://llm-primer.pages.dev). See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) for the CI/CD configuration.

## Contributing

We welcome corrections, translations, new articles, demo proposals, and paper summaries. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md) before submitting.

## License

This project is licensed under the [MIT License](./LICENSE).

## Keywords

`llm` `large-language-models` `transformer` `attention` `rag` `agents` `prompt-engineering` `machine-learning` `nlp` `papers` `bilingual` `education` `astro` `starlight`
