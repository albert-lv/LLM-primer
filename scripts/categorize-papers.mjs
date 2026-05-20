import { readdir, readFile, writeFile } from 'node:fs/promises';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { join } from 'node:path';

const PAPERS_DIR = 'src/content/papers';

const DOMAIN_RULES = [
  { domains: ['architecture'], keywords: ['transformer', 'attention', 'bert', 'gpt1', 'electra', 'roberta', 't5', 'xlnet', 'mqa', 'gqa', 'bytenet', 'seq2seq', 'textcnn', 'convolution', 'lstm', 'glm', 'permutation'] },
  { domains: ['pretraining'], keywords: ['scaling', 'chinchilla', 'kaplan', 'palm', 'pretraining', 'ulmfit', 'word2vec', 'skipgram', 'glove', 'elmo', 'data-quality', 'training-recipe', 'compute-optimal', 'power-law'] },
  { domains: ['alignment'], keywords: ['rlhf', 'dpo', 'ipo', 'lora', 'qlora', 'instructgpt', 'alpaca', 'self-instruct', 'constitutional', 'rlaif', 'sft', 'alignment', 'instruction-tuning', 'preference-optimization', 'ai-feedback', 'summarize'] },
  { domains: ['inference'], keywords: ['quantization', 'flashattention', 'vllm', 'speculative', 'smoothquant', 'awq', 'gptq', 'llmint8', 'kv-cache', 'paged-attention', 'fp8', 'speedup', 'io-awareness', 'sparse', 'efficiency', 'cuda'] },
  { domains: ['applications'], keywords: ['rag', 'retrieval', 'agent', 'tool', 'react', 'reflexion', 'sweagent', 'swe-bench', 'humaneval', 'code-generation', 'mcp', 'toolformer', 'hyde', 'dpr', 'search', 'retro'] },
  { domains: ['evaluation'], keywords: ['mmlu', 'helm', 'mt-bench', 'humaneval', 'evaluation', 'benchmark', 'chatbot-arena', 'red-teaming'] },
  { domains: ['safety'], keywords: ['jailbreak', 'safety', 'adversarial', 'red-teaming', 'universal-attack', 'harmless'] },
  { domains: ['multimodal'], keywords: ['clip', 'flamingo', 'llava', 'gpt4v', 'vision-language', 'multimodal', 'gemini'] },
  { domains: ['reasoning'], keywords: ['cot', 'chain-of-thought', 'tot', 'tree-of-thought', 'self-consistency', 'test-time-compute', 'reasoning', 'least-to-most', 'zeroshot-cot', 'o1', 'slow-thinking'] },
  { domains: ['long-context'], keywords: ['longlora', 'yarn', 'alibi', 'rope', 'long-context', 'transformer-xl'] },
  { domains: ['moe'], keywords: ['mixtral', 'switch', 'glam', 'moe', 'mixture-of-experts'] },
];

const PAPER_DOMAIN_OVERRIDES = {
  'brown2020-gpt3': ['pretraining', 'reasoning'],
  'devlin2018-bert': ['architecture'],
  'radford2018-gpt1': ['architecture', 'pretraining'],
  'radford2019-gpt2': ['pretraining'],
  'openai2023-gpt4': ['pretraining'],
  'openai2023-gpt4v': ['multimodal'],
  'openai2024-o1-systemcard': ['reasoning', 'safety'],
  'bahdanau2014-attention': ['architecture'],
  'vaswani2017-attention': ['architecture'],
  'luong2015-attention': ['architecture'],
  'su2021-rope': ['architecture', 'long-context'],
  'press2021-alibi': ['architecture', 'long-context'],
  'peters2018-elmo': ['architecture'],
  'pennington2014-glove': ['architecture'],
  'mikolov2013-word2vec': ['architecture'],
  'mikolov2013-skipgram-negsampling': ['architecture'],
  'sennrich2016-bpe': ['architecture'],
  'sutskever2014-seq2seq': ['architecture'],
  'kim2014-textcnn': ['architecture'],
  'kalchbrenner2016-bytenet': ['architecture'],
  'howard2018-ulmfit': ['pretraining'],
  'liu2019-roberta': ['pretraining'],
  'raffel2020-t5': ['architecture'],
  'yang2019-xlnet': ['architecture'],
  'clark2020-electra': ['pretraining'],
  'chowdhery2022-palm': ['pretraining'],
  'hoffmann2022-chinchilla': ['pretraining'],
  'kaplan2020-scaling': ['pretraining'],
  'du2021-glam': ['moe', 'pretraining'],
  'fedus2021-switch': ['moe', 'pretraining'],
  'jiang2024-mixtral': ['moe', 'architecture'],
  'zeng2022-glm130b': ['architecture'],
  'deepseek2024-v2': ['architecture', 'inference'],
  'deepseek2024-v3': ['architecture', 'moe'],
  'deepseek2025-r1': ['reasoning', 'alignment'],
  'gunasekar2023-phi1': ['pretraining'],
  'abdin2024-phi3': ['pretraining'],
  'dubey2024-llama3': ['pretraining'],
  'touvron2023-llama': ['pretraining'],
  'touvron2023-llama2': ['pretraining', 'alignment'],
  'jiang2023-mistral7b': ['pretraining'],
  'ai2024-yi': ['pretraining'],
  'bai2023-qwen': ['pretraining'],
  'qwen2024-qwen25': ['pretraining'],
  'gemini2023-team': ['pretraining', 'multimodal'],
  'christiano2017-rlhf': ['alignment'],
  'ouyang2022-instructgpt': ['alignment'],
  'rafailov2023-dpo': ['alignment'],
  'azar2023-ipo': ['alignment'],
  'bai2022-constitutional-ai': ['alignment', 'safety'],
  'bai2022-hh': ['alignment', 'safety'],
  'lee2023-rlaif': ['alignment'],
  'hu2021-lora': ['alignment'],
  'dettmers2023-qlora': ['alignment', 'inference'],
  'taori2023-alpaca': ['alignment'],
  'wang2022-self-instruct': ['alignment'],
  'stiennon2020-summarize': ['alignment'],
  'dao2022-flashattention': ['inference'],
  'dao2023-flashattention2': ['inference'],
  'shah2024-flashattention3': ['inference'],
  'dettmers2022-llmint8': ['inference'],
  'frantar2022-gptq': ['inference'],
  'lin2023-awq': ['inference'],
  'xiao2022-smoothquant': ['inference'],
  'kwon2023-vllm': ['inference'],
  'leviathan2023-spec-decoding': ['inference'],
  'shazeer2019-mqa': ['inference', 'architecture'],
  'ainslie2023-gqa': ['inference', 'architecture'],
  'chen2023-spec-sampling': ['inference'],
  'peng2023-yarn': ['long-context'],
  'chen2023-longlora': ['long-context', 'alignment'],
  'lewis2020-rag': ['applications'],
  'borgeaud2022-retro': ['applications'],
  'karpukhin2020-dpr': ['applications'],
  'gao2022-hyde': ['applications'],
  'yao2022-react': ['applications'],
  'yao2023-tot': ['reasoning', 'applications'],
  'schick2023-toolformer': ['applications'],
  'shinn2023-reflexion': ['applications'],
  'yang2024-sweagent': ['applications'],
  'anthropic2024-mcp': ['applications'],
  'chen2021-humaneval': ['evaluation', 'applications'],
  'jimenez2024-swebench': ['evaluation', 'applications'],
  'hendrycks2020-mmlu': ['evaluation'],
  'liang2022-helm': ['evaluation'],
  'zheng2023-mtbench': ['evaluation'],
  'perez2022-redteaming': ['safety', 'evaluation'],
  'wei2023-jailbroken': ['safety'],
  'zou2023-universal-attack': ['safety'],
  'zhou2022-least-to-most': ['reasoning'],
  'wang2022-self-consistency': ['reasoning'],
  'kojima2022-zeroshot-cot': ['reasoning'],
  'snell2024-test-time-compute': ['reasoning', 'inference'],
  'wei2022-cot': ['reasoning', 'applications'],
  'alayrac2022-flamingo': ['multimodal'],
  'radford2021-clip': ['multimodal'],
  'liu2023-llava': ['multimodal'],
};

const GOOD_TAGS = new Set([
  'transformer', 'attention', 'architecture', 'nlp', 'gpt', 'few-shot', 'scaling', 'in-context-learning',
  'chain-of-thought', 'reasoning', 'prompting', 'bert', 'word2vec', 'word-embeddings', 'embeddings',
  'positional-encoding', 'rope', 'alibi', 'long-context', 'moe', 'mixture-of-experts', 'pre-training',
  'pretraining', 'data-quality', 'compute-optimal', 'scaling-laws', 'power-law', 'rlhf', 'dpo', 'ipo',
  'lora', 'qlora', 'sft', 'alignment', 'instruction-tuning', 'preference-optimization', 'ai-feedback',
  'constitutional-ai', 'self-instruct', 'quantization', 'flashattention', 'vllm', 'speculative-decoding',
  'smoothquant', 'awq', 'gptq', 'int8', 'fp8', 'kv-cache', 'paged-attention', 'sparse', 'efficiency',
  'rag', 'retrieval', 'agent', 'tool-use', 'react', 'reflexion', 'swe-agent', 'code-generation',
  'mcp', 'toolformer', 'hyde', 'dpr', 'search', 'mmlu', 'helm', 'mt-bench', 'humaneval', 'evaluation',
  'benchmark', 'red-teaming', 'jailbreak', 'safety', 'adversarial', 'clip', 'flamingo', 'llava',
  'vision-language', 'multimodal', 'gemini', 'self-consistency', 'tree-of-thoughts', 'test-time-compute',
  'least-to-most', 'zeroshot-cot', 'o1', 'slow-thinking', 'seq2seq', 'lstm', 'cnn', 'textcnn',
  'bytenet', 'glm', 'xlnet', 't5', 'roberta', 'electra', 'elmo', 'glove', 'bpe', 'subword',
  'tokenization', 'decoder-only', 'encoder-decoder', 'masked-lm', 'text-to-text', 'permutation-lm',
  'gqa', 'mqa', 'multi-query-attention', 'grouped-query-attention', 'mla', 'training-recipe',
  'compute', 'sample-efficiency', 'synthetic-data', 'human-feedback', 'rl', 'reinforcement-learning',
  'emergence', 'transfer-learning', 'language-model', 'generation', 'summarization',
  'machine-translation', 'nmt', 'bilingual', 'open-source', 'llama', 'mistral', 'qwen', 'yi', 'phi',
  'deepseek', 'palm', 'codex', 'function-calling', 'coding-agent', 'world-model', 'knowledge',
  'theory', 'contrastive-learning', 'dense-retrieval', 'semantic-search', 'reranking', 'embedding',
  'contextualized', 'negative-sampling', 'io-awareness', 'cuda-optimization', 'parallelization',
  'speedup', 'memory-efficiency', 'outliers', 'activation-quantization', 'weight-quantization',
  'speculative-sampling', 'early-exit', 'cascading', 'distillation', 'edge-models', 'peft',
  'parameter-efficient', 'prefix-tuning', 'adapter', 'prompt-tuning', 'ia3', 'hallucination',
  'faithfulness', 'factuality', 'calibration', 'uncertainty', 'interpretability',
  'mechanistic-interpretability', 'probing', 'attention-visualization', 'circuit-tracing',
  'feature-extraction', 'superposition', 'polysemanticity', 'prompt-injection', 'trojan', 'backdoor',
  'data-poisoning', 'privacy', 'memorization', 'copyright', 'fairness', 'bias', 'toxicity',
  'value-alignment', 'helpful', 'harmless', 'honest', 'hh-rlhf', 'retro',
]);

function isGoodTag(tag) {
  const t = tag.toLowerCase().trim().replace(/\s+/g, '-');
  return GOOD_TAGS.has(t) || GOOD_TAGS.has(tag.toLowerCase().trim());
}

function classifyPaper(paper) {
  const id = paper.id;
  const title = (paper.title || '').toLowerCase();
  
  if (PAPER_DOMAIN_OVERRIDES[id]) {
    return [...new Set(PAPER_DOMAIN_OVERRIDES[id])];
  }
  
  const matched = new Set();
  for (const rule of DOMAIN_RULES) {
    for (const kw of rule.keywords) {
      if (id.includes(kw) || title.includes(kw)) {
        rule.domains.forEach(d => matched.add(d));
      }
    }
  }
  
  return matched.size > 0 ? [...matched] : ['uncategorized'];
}

function cleanTags(paper) {
  const existing = paper.tags || [];
  const cleaned = [];
  for (const tag of existing) {
    if (isGoodTag(tag) && !cleaned.includes(tag)) {
      cleaned.push(tag);
    }
  }
  return cleaned;
}

async function main() {
  const files = await readdir(PAPERS_DIR);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') && !f.startsWith('_'));
  
  let updated = 0;
  const domainsStats = {};
  
  for (const f of yamlFiles) {
    const path = join(PAPERS_DIR, f);
    const content = await readFile(path, 'utf8');
    const paper = parseYaml(content);
    
    if (paper.inbox) continue;
    
    const domains = classifyPaper(paper);
    const tags = cleanTags(paper);
    
    paper.domains = domains;
    paper.tags = tags;
    
    for (const d of domains) {
      domainsStats[d] = (domainsStats[d] || 0) + 1;
    }
    
    const newContent = stringifyYaml(paper, { lineWidth: 120, indent: 2 });
    await writeFile(path, newContent, 'utf8');
    updated++;
  }
  
  console.log(`Updated ${updated} papers`);
  console.log('Domain distribution:');
  for (const [d, c] of Object.entries(domainsStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${d}: ${c}`);
  }
}

main().catch(console.error);
