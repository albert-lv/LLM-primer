# LLM Primer

[![CI](https://github.com/albert-lv/LLM-primer/actions/workflows/ci.yml/badge.svg)](https://github.com/albert-lv/LLM-primer/actions/workflows/ci.yml)
[![Deploy](https://github.com/albert-lv/LLM-primer/actions/workflows/deploy.yml/badge.svg)](https://github.com/albert-lv/LLM-primer/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE.svg)](https://astro.build)
[![Starlight](https://img.shields.io/badge/docs-Starlight-5440D8.svg)](https://starlight.astro.build)

一个**中英双语、多层级、社区驱动**的大语言模型（LLM）知识库，涵盖原理、论文与交互式演示，帮助学习者从直觉理解走向工程实现，再到前沿研究。

> [**English README**](./README.md) · [**在线阅读 / Read Online**](https://llm-primer.pages.dev)

## 学习内容

- **基础 / Foundations** — 分词、注意力、Transformer、采样与解码、位置编码、嵌入、涌现能力
- **训练 / Training** — 预训练与缩放定律、微调与对齐（SFT、RLHF、DPO）
- **推理 / Inference** — KV Cache、量化、高效注意力、长上下文
- **应用 / Applications** — RAG 检索增强、Agent 与工具调用、提示工程、评估与基准、安全

## 项目亮点

- **三级阅读体系**：直觉层（思维模型）、工程层（实现权衡）、研究层（论文与开放问题）
- **中英双语**：完整的中文与英文内容
- **交互式演示**：Tokenizer 可视化、注意力热力图、采样游乐场
- **论文驱动**：80+ 精选论文并附双语 TLDR；关键论断可追溯到论文条目
- **社区共建**：欢迎通过 Issue 与 Pull Request 参与贡献

## 本地开发

要求：**Node 20** 与 **pnpm 9**。

```bash
pnpm install
pnpm dev        # localhost:4321
pnpm build      # 构建到 dist/
pnpm test       # 运行测试
pnpm lint:content  # 校验文章 frontmatter 与论文引用
```

## 部署

站点部署在 [Cloudflare Pages](https://llm-primer.pages.dev)。CI/CD 配置见 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)。

## 贡献

欢迎纠错、翻译、新文章、演示提案与论文摘要。提交前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 与 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)。

## 许可证

本项目采用 [MIT 许可证](./LICENSE)。

## 关键词

`llm` `large-language-models` `transformer` `attention` `rag` `agents` `prompt-engineering` `machine-learning` `nlp` `papers` `bilingual` `education` `astro` `starlight`
