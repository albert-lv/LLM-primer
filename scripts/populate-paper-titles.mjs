#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
import { join } from 'node:path';

const PAPERS = 'src/content/papers';

// Well-known paper titles mapped from their IDs and arXiv IDs
const PAPER_TITLES = {
  'vaswani2017-attention': { title: 'Attention Is All You Need', year: 2017 },
  'brown2020-gpt3': { title: 'Language Models are Few-Shot Learners', year: 2020 },
  'devlin2018-bert': { title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', year: 2018 },
  'radford2021-learning': { title: 'Learning Transferable Visual Models From Natural Language Supervision', year: 2021 },
  'touvron2023-llama': { title: 'LLaMA: Open and Efficient Foundation Language Models', year: 2023 },
  'touvron2023-llama2': { title: 'Llama 2: Open Foundation and Fine-Tuned Chat Models', year: 2023 },
  'ouyang2022-instructgpt': { title: 'Training language models to follow instructions with human feedback', year: 2022 },
  'dao2022-flashattention': { title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness', year: 2022 },
  'dao2023-flashattention2': { title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning', year: 2023 },
  'hoffmann2022-chinchilla': { title: 'Training Compute-Optimal Large Language Models', year: 2022 },
  'kaplan2020-scaling': { title: 'Scaling Laws for Neural Language Models', year: 2020 },
  'wei2022-cot': { title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', year: 2022 },
  'kojima2022-zeroshot-cot': { title: 'Large Language Models are Zero-Shot Reasoners', year: 2022 },
  'yao2022-react': { title: 'ReAct: Synergizing Reasoning and Acting in Language Models', year: 2022 },
  'yao2023-tot': { title: 'Tree of Thoughts: Deliberate Problem Solving with Large Language Models', year: 2023 },
  'lewis2020-rag': { title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', year: 2020 },
  'christiano2017-rlhf': { title: 'Deep Reinforcement Learning from Human Preferences', year: 2017 },
  'stiennon2020-summarize': { title: 'Learning to summarize from human feedback', year: 2020 },
  'bai2022-constitutional-ai': { title: 'Constitutional AI: Harmlessness from AI Feedback', year: 2022 },
  'rafailov2023-dpo': { title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model', year: 2023 },
  'hu2021-lora': { title: 'LoRA: Low-Rank Adaptation of Large Language Models', year: 2021 },
  'dettmers2023-qlora': { title: 'QLoRA: Efficient Finetuning of Quantized LLMs', year: 2023 },
  'kwon2023-vllm': { title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention', year: 2023 },
  'chen2021-humaneval': { title: 'Evaluating Large Language Models Trained on Code', year: 2021 },
  'sennrich2016-bpe': { title: 'Neural Machine Translation of Rare Words with Subword Units', year: 2016 },
  'su2021-rope': { title: 'RoFormer: Enhanced Transformer with Rotary Position Embedding', year: 2021 },
  'press2021-alibi': { title: 'Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation', year: 2021 },
  'shazeer2019-mqa': { title: 'Fast Transformer Decoding: One Write-Head is All You Need', year: 2019 },
  'ainslie2023-gqa': { title: 'GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints', year: 2023 },
  'hendrycks2020-mmlu': { title: 'Measuring Massive Multitask Language Understanding', year: 2020 },
  'wang2022-self-consistency': { title: 'Self-Consistency Improves Chain of Thought Reasoning in Language Models', year: 2022 },
  'schick2023-toolformer': { title: 'Toolformer: Language Models Can Teach Themselves to Use Tools', year: 2023 },
  'shinn2023-reflexion': { title: 'Reflexion: Language Agents with Verbal Reinforcement Learning', year: 2023 },
  'zou2023-universal-attack': { title: 'Universal and Transferable Adversarial Attacks on Aligned Language Models', year: 2023 },
  'wei2023-jailbroken': { title: 'Jailbroken: How Does LLM Safety Training Fail?', year: 2023 },
  'leviathan2023-spec-decoding': { title: 'Fast Inference from Transformers via Speculative Decoding', year: 2023 },
  'chen2023-spec-sampling': { title: 'Accelerating Large Language Model Decoding with Speculative Sampling', year: 2023 },
  'frantar2022-gptq': { title: 'GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers', year: 2022 },
  'lin2023-awq': { title: 'AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration', year: 2023 },
  'xiao2022-smoothquant': { title: 'SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models', year: 2022 },
  'dettmers2022-llmint8': { title: 'LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale', year: 2022 },
  'raffel2020-t5': { title: 'Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer', year: 2020 },
  'liu2019-roberta': { title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach', year: 2019 },
  'yang2019-xlnet': { title: 'XLNet: Generalized Autoregressive Pretraining for Language Understanding', year: 2019 },
  'radford2021-clip': { title: 'Learning Transferable Visual Models From Natural Language Supervision', year: 2021 },
  'dubey2024-llama3': { title: 'The Llama 3 Herd of Models', year: 2024 },
  'jiang2023-mistral7b': { title: 'Mistral 7B', year: 2023 },
  'jiang2024-mixtral': { title: 'Mixtral of Experts', year: 2024 },
  'abdin2024-phi3': { title: 'Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone', year: 2024 },
  'gunasekar2023-phi1': { title: 'Textbooks Are All You Need', year: 2023 },
  'bai2023-qwen': { title: 'Qwen Technical Report', year: 2023 },
  'qwen2024-qwen25': { title: 'Qwen2.5 Technical Report', year: 2024 },
  'deepseek2024-v2': { title: 'DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model', year: 2024 },
  'deepseek2024-v3': { title: 'DeepSeek-V3 Technical Report', year: 2024 },
  'deepseek2025-r1': { title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning', year: 2025 },
  'mikolov2013-word2vec': { title: 'Efficient Estimation of Word Representations in Vector Space', year: 2013 },
  'mikolov2013-skipgram-negsampling': { title: 'Distributed Representations of Words and Phrases and their Compositionality', year: 2013 },
  'peters2018-elmo': { title: 'Deep contextualized word representations', year: 2018 },
  'gao2022-hyde': { title: 'Precise Zero-Shot Dense Retrieval without Relevance Labels', year: 2022 },
  'karpukhin2020-dpr': { title: 'Dense Passage Retrieval for Open-Domain Question Answering', year: 2020 },
  'borgeaud2022-retro': { title: 'Improving language models by retrieving from trillions of tokens', year: 2022 },
  'wang2022-self-instruct': { title: 'Self-Instruct: Aligning Language Models with Self-Generated Instructions', year: 2022 },
  'azar2023-ipo': { title: 'A General Theoretical Paradigm to Understand Learning from Human Preferences', year: 2023 },
  'ethayarajh2024-kto': { title: 'KTO: Model Alignment as Prospect Theoretic Optimization', year: 2024 },
  'lee2023-rlaif': { title: 'RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback', year: 2023 },
  'lightman2023-lets': { title: "Let's Verify Step by Step", year: 2023 },
  'bai2022-hh': { title: 'Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback', year: 2022 },
  'ganguli2022-redteaming': { title: 'Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned', year: 2022 },
  'perez2022-redteaming': { title: 'Red Teaming Language Models with Language Models', year: 2022 },
  'carlini2021-extracting': { title: 'Extracting Training Data from Large Language Models', year: 2021 },
  'greshake2023-notwhat': { title: 'Not what you\'ve signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection', year: 2023 },
  'liang2022-helm': { title: 'Holistic Evaluation of Language Models', year: 2022 },
  'zheng2023-mtbench': { title: 'Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena', year: 2023 },
  'jimenez2024-swebench': { title: 'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?', year: 2024 },
  'yang2024-sweagent': { title: 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering', year: 2024 },
  'liu2023-llava': { title: 'Visual Instruction Tuning', year: 2023 },
  'alayrac2022-flamingo': { title: 'Flamingo: a Visual Language Model for Few-Shot Learning', year: 2022 },
  'chen2023-longlora': { title: 'LongLoRA: Efficient Fine-tuning of Long-Context Large Language Models', year: 2023 },
  'peng2023-yarn': { title: 'YaRN: Efficient Context Window Extension of Large Language Models', year: 2023 },
  'xiao2023-streamingllm': { title: 'Efficient Streaming Language Models with Attention Sinks', year: 2023 },
  'liu2023-h2o': { title: 'H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models', year: 2023 },
  'shah2024-flashattention3': { title: 'FlashAttention-3: Fast and Accurate Attention with Asympotic IO Complexity', year: 2024 },
  'chowdhery2022-palm': { title: 'PaLM: Scaling Language Modeling with Pathways', year: 2022 },
  'fedus2021-switch': { title: 'Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity', year: 2021 },
  'du2021-glam': { title: 'GLaM: Efficient Scaling of Language Models with Mixture-of-Experts', year: 2021 },
  'zeng2022-glm130b': { title: 'GLM-130B: An Open Bilingual Pre-trained Model', year: 2022 },
  'clark2020-electra': { title: 'ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators', year: 2020 },
  'howard2018-ulmfit': { title: 'Universal Language Model Fine-tuning for Text Classification', year: 2018 },
  'sutskever2014-seq2seq': { title: 'Sequence to Sequence Learning with Neural Networks', year: 2014 },
  'bahdanau2014-attention': { title: 'Neural Machine Translation by Jointly Learning to Align and Translate', year: 2014 },
  'luong2015-attention': { title: 'Effective Approaches to Attention-based Neural Machine Translation', year: 2015 },
  'kalchbrenner2016-bytenet': { title: 'Neural Machine Translation in Linear Time', year: 2016 },
  'kim2014-textcnn': { title: 'Convolutional Neural Networks for Sentence Classification', year: 2014 },
  'gururangan2020-dont': { title: "Don't Stop Pretraining: Adapt Language Models to Domains and Tasks", year: 2020 },
  'schwartz2020-right': { title: 'Green AI', year: 2020 },
  'lee2022-deduplicating': { title: 'Deduplicating Training Data Makes Language Models Better', year: 2022 },
  'zhou2022-least-to-most': { title: 'Least-to-Most Prompting Enables Complex Reasoning in Large Language Models', year: 2022 },
  'willard2023-constrained': { title: 'Efficient Guided Generation for Large Language Models', year: 2023 },
  'jacovi2023-stop': { title: 'Stop Uploading Test Data in Plain Text: Practical Strategies for Mitigating Data Contamination by Evaluation Benchmarks', year: 2023 },
  'snell2024-test-time-compute': { title: 'Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters', year: 2024 },
  'ai2024-yi': { title: 'Yi: Open Foundation Models by 01.AI', year: 2024 },
  'gemini2023-team': { title: 'Gemini: A Family of Highly Capable Multimodal Models', year: 2023 },
};

async function main() {
  let updated = 0;

  for (const [id, metadata] of Object.entries(PAPER_TITLES)) {
    try {
      const yamlPath = join(PAPERS, `${id}.yaml`);
      const content = await readFile(yamlPath, 'utf8');
      const stub = parse(content);

      let changed = false;
      if (!stub.title && metadata.title) {
        stub.title = metadata.title;
        changed = true;
      }
      if (stub.year == null && metadata.year) {
        stub.year = metadata.year;
        changed = true;
      }

      if (changed) {
        // Re-order keys for readability
        const ordered = {};
        for (const k of ['id', 'arxiv_id', 'doi', 'source_url', 'title', 'year', 'authors',
                         'tldr_zh', 'tldr_en', 'tags', 'modules', 'domains',
                         'prerequisites', 'inbox']) {
          if (stub[k] !== undefined) ordered[k] = stub[k];
        }
        await writeFile(yamlPath, stringify(ordered, { lineWidth: 0 }));
        updated++;
        console.log(`✓ ${id}`);
      }
    } catch (e) {
      console.error(`✗ ${id}: ${e.message}`);
    }
  }

  console.log(`\nTotal updated: ${updated} papers`);
}

main().catch(console.error);
