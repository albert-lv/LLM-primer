import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const INBOX_DIR = 'src/content/papers/_inbox';
const PAPERS_DIR = 'src/content/papers';

const PROMOTIONS = [
  {
    inboxId: 'inbox-attention-sink-analysis',
    newId: 'xiao2023-streamingllm',
    arxiv_id: '2309.17453',
    title: 'Efficient Streaming Language Models with Attention Sinks',
    year: 2023,
    authors: ['Guangxuan Xiao', 'Yuandong Tian', 'Beidi Chen', 'Song Han', 'Mike Lewis'],
    tldr_zh: '提出 Attention Sink 现象：在自回归生成中，模型始终关注开头的几个初始 token。利用这一发现，StreamingLLM 可以在不重新计算的情况下处理无限长输入流，同时保持性能稳定。',
    tldr_en: 'Discovers the Attention Sink phenomenon: in autoregressive generation, models consistently attend to a few initial tokens. StreamingLLM leverages this to handle infinite-length input streams without recomputation while maintaining stable performance.',
    tags: ['attention-sink', 'long-context', 'streaming', 'inference'],
    modules: ['inference'],
    domains: ['inference', 'long-context'],
  },
  {
    inboxId: 'inbox-kv-cache-compression-methods',
    newId: 'liu2023-h2o',
    arxiv_id: '2306.14048',
    title: 'H2O: Heavy-Hitter Oracle for Accurate KV Cache Compression',
    year: 2023,
    authors: ['Zichang Liu', 'Jue Wang', 'Tri Dao', 'Tianyi Zhou', 'Binhang Yuan'],
    tldr_zh: '发现 KV Cache 中存在"重击者"（Heavy Hitters）现象：少数关键 token 贡献了绝大部分注意力权重。H2O 通过保留这些重击者 token 的 KV，可以在仅保留 20-30% KV Cache 的情况下保持几乎无损的性能。',
    tldr_en: 'Discovers Heavy Hitters in KV Cache: a small set of tokens contributes most attention weights. H2O preserves these heavy-hitter KV pairs, maintaining near-lossless performance with only 20-30% of the original KV cache.',
    tags: ['kv-cache', 'compression', 'heavy-hitters', 'inference'],
    modules: ['inference'],
    domains: ['inference'],
  },
  {
    inboxId: 'inbox-memorization-and-privacy-risks',
    newId: 'carlini2021-extracting',
    arxiv_id: '2012.07805',
    title: 'Extracting Training Data from Large Language Models',
    year: 2021,
    authors: ['Nicholas Carlini', 'Florian Tramer', 'Eric Wallace', 'Matthew Jagielski', 'Ariel Herbert-Voss', 'Katherine Lee', 'Adam Roberts', 'Tom Brown', 'Dawn Song', 'Ulfar Erlingsson', 'Alina Oprea', 'Colin Raffel'],
    tldr_zh: '展示了从 GPT-2 等语言模型中提取训练数据片段的可行性。通过精心设计的解码策略，可以从模型中恢复出数百条逐字记忆的训练样本，揭示了大规模语言模型的隐私风险。',
    tldr_en: 'Demonstrates the feasibility of extracting training data fragments from language models like GPT-2. Through carefully designed decoding strategies, hundreds of verbatim memorized training examples can be recovered, revealing privacy risks in large language models.',
    tags: ['privacy', 'memorization', 'data-extraction', 'safety'],
    modules: ['applications'],
    domains: ['safety'],
  },
  {
    inboxId: 'inbox-red-teaming-language-models',
    newId: 'ganguli2022-redteaming',
    arxiv_id: '2209.07858',
    title: 'Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned',
    year: 2022,
    authors: ['Deep Ganguli', 'Liane Lovitt', 'Jackson Kernion', 'Amanda Askell', 'Yuntao Bai', 'Saurav Kadavath', 'Ben Mann', 'Ethan Perez', 'Nicholas Schiefer', 'Kamal Ndousse', 'Andy Jones', 'Sam Bowman', 'Anna Chen', 'Tom Conerly', 'Nova DasSarma', 'Dawn Drain', 'Nelson Elhage', 'Sheer El Showk', 'Stanislav Fort', 'Zac Hatfield-Dodds', 'Tom Henighan', 'Danny Hernandez', 'Tristan Hume', 'Joshua Landau', 'Katherine Lee', 'Daniel Li', 'Tom Liao', 'Chris Olah', 'Catherine Olsson', 'Dario Amodei', 'Tom Brown', 'Jack Clark', 'Sam McCandlish', 'Chris Wallace', 'Jared Kaplan'],
    tldr_zh: '系统研究了语言模型的红队测试方法，发现随着模型规模增大，有害输出率反而可能下降，但模型也变得更擅长绕过人类编写的安全规则。提出了规模化红队测试的最佳实践。',
    tldr_en: 'Systematically studies red teaming methods for language models, finding that harmful output rates may decrease with scale, but models become better at circumventing human-written safety rules. Proposes best practices for scaled red teaming.',
    tags: ['red-teaming', 'safety', 'scaling', 'alignment'],
    modules: ['applications'],
    domains: ['safety', 'evaluation'],
  },
  {
    inboxId: 'inbox-structured-output-generation',
    newId: 'willard2023-constrained',
    arxiv_id: '2307.09702',
    title: 'Efficient Guided Generation for Large Language Models',
    year: 2023,
    authors: ['Brandon T. Willard', 'Remi Louf'],
    tldr_zh: '提出高效的约束解码方法，让大语言模型在生成过程中实时遵守 JSON Schema、正则表达式或上下文无关文法。通过将语法约束转化为有限状态自动机，在几乎不增加延迟的情况下保证输出格式正确。',
    tldr_en: 'Proposes efficient constrained decoding that enforces JSON Schema, regular expressions, or context-free grammars during generation. Converts syntax constraints into finite-state automata, guaranteeing correct output format with minimal latency overhead.',
    tags: ['constrained-decoding', 'structured-output', 'grammar', 'inference'],
    modules: ['inference'],
    domains: ['inference', 'applications'],
  },
  {
    inboxId: 'inbox-prompt-injection-defense-study',
    newId: 'greshake2023-notwhat',
    arxiv_id: '2302.12173',
    title: 'Not What You Have Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
    year: 2023,
    authors: ['Kai Greshake', 'Saif Abdelnabi', 'Shrihari Mishra', 'Christoph Endres', 'Thorsten Holz', 'Mario Fritz'],
    tldr_zh: '揭示了间接提示注入攻击：攻击者通过控制 LLM 应用处理的外部数据（如网页、邮件、文档）来注入恶意指令，从而操控应用行为。展示了 Bing Chat、GitHub Copilot 等真实应用中的攻击场景。',
    tldr_en: 'Reveals indirect prompt injection attacks: adversaries control external data processed by LLM applications (web pages, emails, documents) to inject malicious instructions and hijack application behavior. Demonstrates attacks on Bing Chat, GitHub Copilot, and other real applications.',
    tags: ['prompt-injection', 'safety', 'adversarial', 'security'],
    modules: ['applications'],
    domains: ['safety'],
  },
  {
    inboxId: 'inbox-dataset-deduplication-for-pretraining',
    newId: 'lee2022-deduplicating',
    arxiv_id: '2107.06499',
    title: 'Deduplicating Training Data Makes Language Models Better',
    year: 2022,
    authors: ['Katherine Lee', 'Daphne Ippolito', 'Andrew Nystrom', 'Chiyuan Zhang', 'Douglas Eck', 'Chris Callison-Burch', 'Nicholas Carlini'],
    tldr_zh: '系统证明训练数据去重能显著提升语言模型性能并减少记忆效应。通过在 C4 和 RealNews 数据集上去除近似重复和精确重复，模型在下游任务上表现更好，且生成训练数据副本的概率大幅降低。',
    tldr_en: 'Systematically demonstrates that deduplicating training data significantly improves language model performance and reduces memorization. By removing near-duplicate and exact-duplicate examples from C4 and RealNews, models perform better on downstream tasks and are far less likely to emit training data verbatim.',
    tags: ['deduplication', 'data-quality', 'pretraining', 'privacy'],
    modules: ['training'],
    domains: ['pretraining'],
  },
  {
    inboxId: 'inbox-preference-optimization-survey',
    newId: 'ethayarajh2024-kto',
    arxiv_id: '2402.01306',
    title: 'KTO: Model Alignment as Prospect Theoretic Optimization',
    year: 2024,
    authors: ['Kawin Ethayarajh', 'Yejin Choi', 'Swabha Swayamdipta'],
    tldr_zh: '提出 KTO（Kahneman-Tversky Optimization），仅需二元反馈（好/坏）即可对齐模型，无需像 DPO 那样需要成对偏好数据。将前景理论引入对齐优化，证明单条输出是否被喜欢的信号足以学习人类偏好。',
    tldr_en: 'Proposes KTO (Kahneman-Tversky Optimization), which aligns models using only binary feedback (good/bad) without requiring paired preference data like DPO. Introduces prospect theory into alignment optimization, proving that knowing whether a single output is desirable is sufficient to learn human preferences.',
    tags: ['preference-optimization', 'alignment', 'kto', 'dpo'],
    modules: ['training'],
    domains: ['alignment'],
  },
  {
    inboxId: 'inbox-continual-pretraining-for-domain-adaptation',
    newId: 'gururangan2020-dont',
    arxiv_id: '2004.10964',
    title: 'Do not Stop Pretraining: Adapt Language Models to Domains and Tasks',
    year: 2020,
    authors: ['Suchin Gururangan', 'Ana Marasovic', 'Swabha Swayamdipta', 'Kyle Lo', 'Iz Beltagy', 'Doug Downey', 'Noah A. Smith'],
    tldr_zh: '证明了在目标领域数据上继续预训练（Domain-Adaptive Pretraining, DAPT）能显著提升任务表现。在生物医学、计算机科学、新闻和评论四个领域上，DAPT 相比直接使用通用预训练模型平均提升 4-8 个百分点。',
    tldr_en: 'Demonstrates that continuing pretraining on target-domain data (Domain-Adaptive Pretraining, DAPT) significantly improves task performance. Across biomedical, computer science, news, and reviews domains, DAPT improves over generic pretrained models by 4-8 percentage points on average.',
    tags: ['continual-pretraining', 'domain-adaptation', 'pretraining', 'transfer-learning'],
    modules: ['training'],
    domains: ['pretraining'],
  },
  {
    inboxId: 'inbox-training-stability-recipes',
    newId: 'chowdhery2022-palm',
    arxiv_id: '2204.02311',
    title: 'PaLM: Scaling Language Modeling with Pathways',
    year: 2022,
    authors: ['Aakanksha Chowdhery', 'Sharan Narang', 'Jacob Devlin', 'Maarten Bosma', 'Gaurav Mishra', 'Adam Roberts', 'Paul Barham', 'Hyung Won Chung', 'Charles Sutton', 'Sebastian Gehrmann', 'Parker Schuh', 'Kensen Shi', 'Sasha Tsvyashchenko', 'Joshua Maynez', 'Abhishek Rao', 'Parker Barnes', 'Yi Tay', 'Noam Shazeer', 'Vinodkumar Prabhakaran', 'Emily Reif', 'Nan Du', 'Ben Hutchinson', 'Reiner Pope', 'James Bradbury', 'Jacob Austin', 'Michael Isard', 'Guy Gur-Ari', 'Pengcheng Yin', 'Toju Duke', 'Anselm Levskaya', 'Sanjay Ghemawat', 'Sunipa Dev', 'Henryk Michalewski', 'Xavier Garcia', 'Vedant Misra', 'Kevin Robinson', 'Liam Fedus', 'Denny Zhou', 'Daphne Ippolito', 'David Luan', 'Hyeontaek Lim', 'Barret Zoph', 'Alexander Spiridonov', 'Ryan Sepassi', 'David Dohan', 'Shivani Agrawal', 'Mark Omernick', 'Andrew M. Dai', 'Thanumalayan Sankaranarayana Pillai', 'Marie Pellat', 'Aitor Lewkowycz', 'Erica Moreira', 'Rewon Child', 'Oleksandr Polozov', 'Katherine Lee', 'Zongwei Zhou', 'Xuezhi Wang', 'Brennan Saeta', 'Mark Diaz', 'Orhan Firat', 'Michele Catasta', 'Jason Wei', 'Kathy Meier-Hellstern', 'Douglas Eck', 'Jeff Dean', 'Slav Petrov', 'Noah Fiedel'],
    tldr_zh: 'Google 的 540B 参数 PaLM 模型，展示了 Pathways 系统上的大规模训练。论文详细记录了训练稳定性技术、数据混合策略和涌现能力观察，是大模型预训练工程的重要参考。',
    tldr_en: 'Google\'s 540B parameter PaLM model trained on the Pathways system. The paper details training stability techniques, data mixture strategies, and observations of emergent capabilities, serving as an important reference for large-model pretraining engineering.',
    tags: ['pretraining', 'scaling', 'pathways', 'emergence', 'training-stability'],
    modules: ['training'],
    domains: ['pretraining'],
  },
  {
    inboxId: 'inbox-llm-as-judge-reliability',
    newId: 'wang2023-large',
    arxiv_id: '2306.05685',
    title: 'Large Language Models are not Fair Evaluators',
    year: 2023,
    authors: ['Peiyi Wang', 'Lei Li', 'Liang Chen', 'Dawei Zhu', 'Binghuai Lin', 'Yunbo Cao', 'Qi Liu', 'Tianyu Liu', 'Zhifang Sui'],
    tldr_zh: '系统评估了 LLM-as-a-Judge 方法的偏见问题：位置偏见（偏好第一个回答）、长度偏见（偏好更长的回答）和自增强偏见（偏好自己生成的内容）。提出了缓解这些偏见的方法，如交换位置评分和引入参考答案。',
    tldr_en: 'Systematically evaluates bias issues in LLM-as-a-Judge methods: position bias (preferring the first response), length bias (preferring longer responses), and self-enhancement bias (preferring self-generated content). Proposes mitigation methods such as position-swapped evaluation and reference-based scoring.',
    tags: ['llm-as-judge', 'evaluation', 'bias', 'alignment'],
    modules: ['applications'],
    domains: ['evaluation'],
  },
  {
    inboxId: 'inbox-benchmark-contamination-detection',
    newId: 'jacovi2023-stop',
    arxiv_id: '2307.03101',
    title: 'Stop Uploading Test Data in Plain Text: New Protocols for Dataset Release',
    year: 2023,
    authors: ['Alon Jacovi', 'Avi Caciularu', 'Omer Goldman', 'Yoav Goldberg'],
    tldr_zh: '提出检测和预防基准数据污染的系统方法。通过分析模型在污染数据上的异常表现模式（如逐字记忆测试集），可以可靠地检测预训练数据是否包含公开测试集。呼吁发布加密或延迟公开的测试集。',
    tldr_en: 'Proposes systematic methods for detecting and preventing benchmark data contamination. By analyzing anomalous performance patterns on contaminated data (such as verbatim memorization of test sets), it reliably detects whether pretraining data contains publicly available test sets. Calls for releasing encrypted or delayed-public test sets.',
    tags: ['contamination', 'benchmark', 'evaluation', 'data-leakage'],
    modules: ['applications'],
    domains: ['evaluation'],
  },
  {
    inboxId: 'inbox-reasoning-trace-verification',
    newId: 'lightman2023-lets',
    arxiv_id: '2305.20050',
    title: 'Let\'s Verify Step by Step',
    year: 2023,
    authors: ['Hunter Lightman', 'Vineet Kosaraju', 'Yura Burda', 'Harri Edwards', 'Bowen Baker', 'Teddy Lee', 'Jan Leike', 'John Schulman', 'Ilya Sutskever', 'Karl Cobbe'],
    tldr_zh: '提出过程监督（Process Supervision）方法：不仅奖励最终正确答案，还奖励每一步推理的正确性。通过训练一个验证器来评估每个推理步骤，在数学推理任务上显著优于仅奖励最终结果的结果监督（Outcome Supervision）。',
    tldr_en: 'Proposes process supervision: rewarding not just the final correct answer but also the correctness of each reasoning step. By training a verifier to evaluate each step, significantly outperforms outcome supervision (which only rewards the final result) on mathematical reasoning tasks.',
    tags: ['process-supervision', 'reasoning', 'verification', 'math', 'prm'],
    modules: ['applications'],
    domains: ['reasoning', 'evaluation'],
  },
  {
    inboxId: 'inbox-adaptive-computation-for-llms',
    newId: 'schwartz2020-right',
    arxiv_id: '2003.03618',
    title: 'The Right Tool for the Job: Matching Model and Instance Complexities',
    year: 2020,
    authors: ['Roy Schwartz', 'Gabriel Stanovsky', 'Shie Mannar', 'Jesse Dodge', 'Noah A. Smith'],
    tldr_zh: '提出自适应计算思想：不同输入实例需要的计算量不同。通过训练一个轻量级路由器将简单样本分配给较小模型、复杂样本分配给较大模型，可以在几乎不损失精度的情况下将平均推理成本降低 2-3 倍。',
    tldr_en: 'Proposes adaptive computation: different input instances require different amounts of computation. By training a lightweight router to assign simple samples to smaller models and complex samples to larger models, reduces average inference cost by 2-3x with minimal accuracy loss.',
    tags: ['adaptive-computation', 'early-exit', 'cascading', 'efficiency', 'inference'],
    modules: ['inference'],
    domains: ['inference'],
  },
  {
    inboxId: 'inbox-long-context-retrieval-benchmark',
    newId: 'kamradt2023-needle',
    source_url: 'https://github.com/gkamradt/LLMTest_NeedleInAHaystack',
    title: 'Needle in a Haystack — Pressure Testing LLMs',
    year: 2023,
    authors: ['Greg Kamradt'],
    tldr_zh: '提出"大海捞针"（Needle-in-a-Haystack）测试方法：在长文本中随机插入一个关键事实，测试模型能否在回答问题准确定位该事实。成为评估长上下文模型事实检索能力的事实标准方法，揭示了大多数模型在长文本中的"lost in the middle"问题。',
    tldr_en: 'Proposes the Needle-in-a-Haystack test: inserting a key fact at random positions in a long document and testing whether the model can locate it when answering questions. Became the de facto standard for evaluating factual retrieval in long-context models, revealing the "lost in the middle" problem in most models.',
    tags: ['needle-in-a-haystack', 'long-context', 'evaluation', 'retrieval'],
    modules: ['inference'],
    domains: ['long-context', 'evaluation'],
  },
  {
    inboxId: 'inbox-vision-language-alignment',
    newId: 'radford2021-learning',
    arxiv_id: '2103.00020',
    title: 'Learning Transferable Visual Models From Natural Language Supervision',
    year: 2021,
    authors: ['Alec Radford', 'Jong Wook Kim', 'Chris Hallacy', 'Aditya Ramesh', 'Gabriel Goh', 'Sandhini Agarwal', 'Girish Sastry', 'Amanda Askell', 'Pamela Mishkin', 'Jack Clark', 'Gretchen Krueger', 'Ilya Sutskever'],
    tldr_zh: 'CLIP 的原始论文，提出使用自然语言监督来学习可迁移的视觉表示。通过在 4 亿对图像-文本数据上训练对比学习模型，CLIP 实现了零样本图像分类，并展示了强大的跨任务迁移能力，开创了视觉-语言对齐的新范式。',
    tldr_en: 'The original CLIP paper, proposing learning transferable visual representations from natural language supervision. By training a contrastive model on 400 million image-text pairs, CLIP achieves zero-shot image classification and demonstrates strong cross-task transferability, pioneering a new paradigm for vision-language alignment.',
    tags: ['clip', 'vision-language', 'contrastive-learning', 'multimodal', 'zero-shot'],
    modules: ['foundations'],
    domains: ['multimodal'],
  },
];

async function main() {
  let promoted = 0;
  for (const promo of PROMOTIONS) {
    const inboxPath = join(INBOX_DIR, `${promo.inboxId}.yaml`);
    const newPath = join(PAPERS_DIR, `${promo.newId}.yaml`);
    
    try {
      await readFile(inboxPath, 'utf8');
    } catch {
      console.log(`SKIP: ${promo.inboxId} not found`);
      continue;
    }
    
    const paper = {
      id: promo.newId,
      ...(promo.arxiv_id ? { arxiv_id: promo.arxiv_id } : {}),
      ...(promo.source_url ? { source_url: promo.source_url } : {}),
      title: promo.title,
      year: promo.year,
      authors: promo.authors,
      tldr_zh: promo.tldr_zh,
      tldr_en: promo.tldr_en,
      tags: promo.tags,
      modules: promo.modules,
      domains: promo.domains,
      inbox: false,
    };
    
    await writeFile(newPath, stringifyYaml(paper, { lineWidth: 120, indent: 2 }), 'utf8');
    await unlink(inboxPath);
    console.log(`PROMOTED: ${promo.inboxId} -> ${promo.newId}`);
    promoted++;
  }
  console.log(`\nTotal promoted: ${promoted}`);
}

main().catch(console.error);
