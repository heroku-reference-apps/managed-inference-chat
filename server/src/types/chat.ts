import { ModelConfig, ErrorResponse } from './shared.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolRuntimeParams {
  max_calls?: number;
  target_app_name?: string;
  tool_params?: Record<string, unknown>;
}

export interface SelectedTool {
  type: 'heroku_tool' | 'mcp';
  name: string;
  runtime_params?: ToolRuntimeParams;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  reasoning?: boolean;
  agents?: string[];
  tools?: SelectedTool[];
  stream?: boolean;
}

export interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  tools?: {
    type: string;
    name: string;
    runtime_params?: ToolRuntimeParams;
  }[];
  extended_thinking?: {
    enabled: boolean;
    budget_tokens: number;
    include_reasoning: boolean;
  };
}

export type { ModelConfig, ErrorResponse };
