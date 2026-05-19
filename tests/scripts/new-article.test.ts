import { describe, expect, it } from 'vitest';
import { articlePath, articleTemplate, componentPrefix, parseArgs } from '../../scripts/new-article.mjs';

describe('new article scaffolder', () => {
  it('parses required flags with default zh', () => {
    expect(parseArgs(['--slug', 'my-topic', '--module', 'foundations'])).toEqual({ slug: 'my-topic', module: 'foundations', lang: 'zh' });
  });

  it('builds language-specific paths and import prefixes', () => {
    expect(articlePath({ slug: 'x', module: 'foundations', lang: 'zh' })).toBe('src/content/docs/foundations/x.mdx');
    expect(articlePath({ slug: 'x', module: 'foundations', lang: 'en' })).toBe('src/content/docs/en/foundations/x.mdx');
    expect(componentPrefix('en')).toBe('../../../../components');
  });

  it('renders core frontmatter and imports', () => {
    const tpl = articleTemplate({ slug: 'my-topic', module: 'training', lang: 'zh' });
    expect(tpl).toContain('status: draft');
    expect(tpl).toContain("import TierSwitcher from '../../../components/TierSwitcher.astro'");
    expect(tpl).toContain('<PaperList ids={[]} />');
  });
});
