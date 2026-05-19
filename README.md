# LLM Primer

A bilingual, multi-tier, community-driven knowledge base for LLM principles and papers.

> [**中文文档**](./README.zh-CN.md) | [**English Documentation**](https://llm-primer.pages.dev/en/)

## Overview

Learn large language models from intuition to research through interactive demos, engineering insights, and curated papers.

- **Design Docs**: [`docs/plans/`](./docs/plans/)
- **Paper Research**: [`docs/research/`](./docs/research/)
- **Live Site**: [https://llm-primer.pages.dev](https://llm-primer.pages.dev)

## Local Development

Requirements: Node 20 and pnpm 9.

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # build to dist/
pnpm test       # run tests
```

## Deployment

Deployed to Cloudflare Pages. See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) for CI/CD configuration.
