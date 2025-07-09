import type { PredefinedPrompt } from '@/types/chat';

export const PREDEFINED_PROMPTS: PredefinedPrompt[] = [
  {
    id: 'simple-question',
    title: 'Explain Managed Inference simple terms',
    prompt: 'Explain Managed Inference in simple terms',
    tools: [],
    model: 'claude-4-sonnet',
  },
  {
    id: 'python-script',
    title: 'Generate Python code with execution',
    prompt:
      'Create a simple Python script that generates 10 random numbers and calculates their average',
    tools: ['code_exec_python'],
    model: 'claude-3-5-sonnet-latest',
  },
  {
    id: 'html-to-markdown',
    title: 'Fetch algorithm from Wikipedia and implement it in Node.js',
    prompt:
      'Fetch the Binary search algorithm from https://en.wikipedia.org/wiki/Binary_search then implement and execute it in Node.js',
    tools: ['html_to_markdown', 'code_exec_node'],
    model: 'claude-3-7-sonnet',
  },
];
