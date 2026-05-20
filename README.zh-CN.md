# LLM Primer

双语、多 tier、社区 PR 驱动的 LLM 原理与论文知识库。

> A bilingual, multi-tier, community-PR-driven knowledge base for LLM principles and papers.

## 概述

从直觉、工程到研究，通过交互式演示、工程洞察和精选论文系统学习大语言模型。

### 内容模块

- **基础 / Foundations** — Tokenization、Attention、Transformer、采样与解码、位置编码、Embedding、涌现能力
- **训练 / Training** — 预训练与 Scaling Law、微调与对齐（SFT、RLHF、DPO）
- **推理 / Inference** — KV Cache 与量化、高效注意力、长上下文
- **应用 / Applications** — RAG 与检索增强、Agent 与工具使用、提示工程、评估与基准、安全与对抗

### 论文库

80+ 篇精选 LLM 论文，附双语 TLDR。每篇论文链接回引用它的文章。

### 核心特性

- **三档阅读层级**：直觉派（心智模型）、工程派（实现取舍）、研究派（论文与开放问题）
- **双语支持**：完整的中文和英文内容
- **交互式演示**：Tokenizer 可视化、注意力热力图、采样 playground
- **论文驱动**：关键说法追溯到精选论文；未审核候选论文留在 inbox

## 本地开发 / Local Dev

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # build to dist/
pnpm test       # run tests
pnpm lint:content  # 验证文章 frontmatter 和论文引用
```

## 部署 / Deploy

Cloudflare Pages — see [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
