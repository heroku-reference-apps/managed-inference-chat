import { ModelConfig } from '../types/shared.js';

interface Config {
  system_prompt: string;
  models: {
    [key: string]: ModelConfig;
  };
  tools: {
    [key: string]: {
      type: string;
      name: string;
      runtime_params?: {
        target_app_name?: string;
        max_retries?: number;
      };
    };
  };
}

export const config: Config = {
  system_prompt:
    process.env.SYSTEM_PROMPT ||
    'You are a helpful assistant that can answer questions and help with tasks.',
  models: {
    // Claude 4.5 models
    'claude-4-5-sonnet': {
      INFERENCE_URL: process.env.INFERENCE_4_5_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_4_5_KEY || 'inf-1234567890',
    },
    'claude-4-5-haiku': {
      INFERENCE_URL: process.env.INFERENCE_4_5_HAIKU_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_4_5_HAIKU_KEY || 'inf-1234567890',
    },
    // Claude 4 models
    'claude-4-sonnet': {
      INFERENCE_URL: process.env.INFERENCE_4_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_4_KEY || 'inf-1234567890',
    },
    // Claude 3.7 models
    'claude-3-7-sonnet': {
      INFERENCE_URL: process.env.INFERENCE_3_7_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_3_7_KEY || 'inf-1234567890',
    },
    // Claude 3.5 models
    'claude-3-5-sonnet-latest': {
      INFERENCE_URL: process.env.INFERENCE_3_5_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_3_5_KEY || 'inf-1234567890',
    },
    'claude-3-5-haiku': {
      INFERENCE_URL: process.env.INFERENCE_3_5_HAIKU_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_3_5_HAIKU_KEY || 'inf-1234567890',
    },
    // Amazon Nova models
    'nova-lite': {
      INFERENCE_URL: process.env.INFERENCE_NOVA_LITE_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_NOVA_LITE_KEY || 'inf-1234567890',
    },
    'nova-pro': {
      INFERENCE_URL: process.env.INFERENCE_NOVA_PRO_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_NOVA_PRO_KEY || 'inf-1234567890',
    },
    // Other models
    'gpt-oss-120b': {
      INFERENCE_URL: process.env.INFERENCE_GPT_OSS_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_GPT_OSS_KEY || 'inf-1234567890',
    },
    'stable-image-ultra': {
      DIFFUSION_URL: process.env.DIFFUSION_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.DIFFUSION_KEY || 'inf-1234567890',
    },
  },
  tools: {
    html_to_markdown: {
      type: 'heroku_tool',
      name: 'html_to_markdown',
    },
    pdf_to_markdown: {
      type: 'heroku_tool',
      name: 'pdf_to_markdown',
    },
    code_exec_python: {
      type: 'heroku_tool',
      name: 'code_exec_python',
    },
    code_exec_ruby: {
      type: 'heroku_tool',
      name: 'code_exec_ruby',
    },
    code_exec_node: {
      type: 'heroku_tool',
      name: 'code_exec_node',
    },
    code_exec_go: {
      type: 'heroku_tool',
      name: 'code_exec_go',
    },
  },
};

export const getModels = () => {
  const availableModels: string[] = [];

  // Claude 4.5 models
  if (process.env.INFERENCE_4_5_URL) {
    availableModels.push('claude-4-5-sonnet');
  }

  if (process.env.INFERENCE_4_5_HAIKU_URL) {
    availableModels.push('claude-4-5-haiku');
  }

  // Claude 4 models
  if (process.env.INFERENCE_4_URL) {
    availableModels.push('claude-4-sonnet');
  }

  // Claude 3.7 models
  if (process.env.INFERENCE_3_7_URL) {
    availableModels.push('claude-3-7-sonnet');
  }

  // Claude 3.5 models
  if (process.env.INFERENCE_3_5_URL) {
    availableModels.push('claude-3-5-sonnet-latest');
  }

  if (process.env.INFERENCE_3_5_HAIKU_URL) {
    availableModels.push('claude-3-5-haiku');
  }

  // Amazon Nova models
  if (process.env.INFERENCE_NOVA_LITE_URL) {
    availableModels.push('nova-lite');
  }

  if (process.env.INFERENCE_NOVA_PRO_URL) {
    availableModels.push('nova-pro');
  }

  // Other models
  if (process.env.INFERENCE_GPT_OSS_URL) {
    availableModels.push('gpt-oss-120b');
  }

  if (process.env.DIFFUSION_URL) {
    availableModels.push('stable-image-ultra');
  }

  return availableModels;
};

export const getTool = (tool: string) => {
  return config.tools[tool];
};

export const getModel = (model: string) => {
  return config.models[model];
};
