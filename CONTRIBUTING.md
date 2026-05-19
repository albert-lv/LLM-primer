# Contributing

## Local development

Use Node 20 and pnpm 9.

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm lint:content
pnpm build
```

## New article workflow

Run `pnpm new:article -- --slug my-topic --module foundations` for Chinese/default content, or add `--lang en` for English. Keep frontmatter accurate: `module`, `status`, `tiers`, `papers`, and `updated` for published pages.

## Tier writing guidelines

- `intro`: explain intuition, vocabulary, and one concrete example.
- `engineer`: cover implementation details, trade-offs, failure modes, and evaluation.
- `research`: cite evidence, assumptions, limitations, and open questions.

## Paper adoption

Unreviewed candidates live in `src/content/papers/_inbox` with `inbox: true`. Move a paper to `src/content/papers/` only after adding useful bilingual TLDRs and checking article references.

## Review guidelines

Prefer small PRs. Verify content claims, links, MDX rendering, tier behavior, and interactive components. Run the validation commands before requesting review.
