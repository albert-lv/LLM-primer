# 贡献指南

## 本地开发

使用 Node 20 和 pnpm 9。

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm lint:content
pnpm build
```

## 新文章工作流程

运行 `pnpm new:article -- --slug my-topic --module foundations` 创建中文/默认内容，或添加 `--lang en` 创建英文内容。保持 frontmatter 准确：`module`、`status`、`tiers`、`papers` 和 `updated` 字段对已发布页面很重要。

## Tier 写作指南

- `intro`：解释直觉、词汇和一个具体示例。
- `engineer`：涵盖实现细节、权衡、失败模式和评估。
- `research`：引用证据、假设、限制和开放问题。

## 论文采纳

未审阅的候选论文存放在 `src/content/papers/_inbox` 并带有 `inbox: true`。只有在添加有用的双语 TLDR 并检查文章引用后，才将论文移至 `src/content/papers/`。

## 审查指南

优先小型 PR。验证内容声明、链接、MDX 渲染、tier 行为和交互式组件。在请求审查前运行验证命令。
