import path from 'node:path';

const injected = new WeakSet();

function estreeLiteral(value) {
  return { type: 'Literal', value };
}

function estreeProgram(expression) {
  return {
    type: 'Program',
    sourceType: 'module',
    body: [{ type: 'ExpressionStatement', expression }],
  };
}

function mdxExpressionValue(jsSource, expression) {
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: jsSource,
    data: { estree: estreeProgram(expression) },
  };
}

function attrString(name, value) {
  const jsSource = JSON.stringify(value);
  return {
    type: 'mdxJsxAttribute',
    name,
    value: mdxExpressionValue(jsSource, estreeLiteral(value)),
  };
}

function attrArray(name, values) {
  const safe = Array.isArray(values) ? values : [];
  const jsSource = JSON.stringify(safe);
  return {
    type: 'mdxJsxAttribute',
    name,
    value: mdxExpressionValue(jsSource, {
      type: 'ArrayExpression',
      elements: safe.map((v) => estreeLiteral(v)),
    }),
  };
}

function importNode(defaultName, specifierPath) {
  return {
    type: 'mdxjsEsm',
    value: `import ${defaultName} from ${JSON.stringify(specifierPath)};`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            source: estreeLiteral(specifierPath),
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: defaultName },
              },
            ],
          },
        ],
      },
    },
  };
}

function parseMeta(meta) {
  const raw = (meta ?? '').trim();
  if (!raw) return { run: false, packages: [] };
  const stripped = raw.startsWith('{') && raw.endsWith('}') ? raw.slice(1, -1).trim() : raw;
  const tokens = stripped.split(/\s+/g).filter(Boolean);

  let run = false;
  let packages = [];
  for (const token of tokens) {
    if (token === 'run') run = true;
    if (token.startsWith('pkg=')) {
      const list = token.slice('pkg='.length).trim();
      packages = list ? list.split(',').map((x) => x.trim()).filter(Boolean) : [];
    }
  }

  return { run, packages };
}

function resolveImportPath(file) {
  const componentAbs = path.join(process.cwd(), 'src/components/islands/RunnableCode.tsx');
  const filePath = file?.path ? String(file.path) : null;
  if (!filePath) return '../../../components/islands/RunnableCode';

  const rel = path.relative(path.dirname(filePath), componentAbs).replace(/\\/g, '/').replace(/\.tsx$/i, '');
  if (rel.startsWith('.')) return rel;
  return `./${rel}`;
}

export default function remarkRunnableCode() {
  return (tree, file) => {
    if (injected.has(tree)) return;
    injected.add(tree);

    let used = false;
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      const children = node.children;
      if (!Array.isArray(children)) return;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || typeof child !== 'object') continue;

        if (child.type === 'code') {
          const { run, packages } = parseMeta(child.meta);
          if (run) {
            used = true;
            children[i] = {
              type: 'mdxJsxFlowElement',
              name: 'RunnableCode',
              attributes: [
                attrString('code', child.value ?? ''),
                attrString('lang', child.lang ?? 'python'),
                attrArray('packages', packages),
              ],
              children: [],
            };
            continue;
          }
        }

        walk(child);
      }
    };

    walk(tree);

    if (!used) return;

    const specifierPath = resolveImportPath(file);
    const alreadyHasImport = Array.isArray(tree.children) && tree.children.some((n) => {
      return n?.type === 'mdxjsEsm' && typeof n.value === 'string' && n.value.includes('RunnableCode');
    });
    if (alreadyHasImport) return;

    tree.children.unshift(importNode('RunnableCode', specifierPath));
  };
}
