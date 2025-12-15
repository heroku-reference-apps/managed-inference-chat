import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { RateLimitOptions, errorResponseBuilderContext } from '@fastify/rate-limit';
import { config, getModel, getTool, getModels } from '../lib/config.js';
import { ChatRequest, ChatRequestBody, ErrorResponse, SelectedTool } from '../types/chat.js';
import { verifyRequest } from '../middleware/security.js';

export const chatRoute: FastifyPluginAsync = async fastify => {
  // Get available models endpoint
  fastify.get('/api/models', async (request, reply) => {
    try {
      const availableModels = getModels();
      return reply.send({ models: availableModels });
    } catch (error) {
      console.error('Error fetching models:', error);
      return reply.code(500).send({ error: 'Failed to fetch available models' });
    }
  });

  // Add security middleware for protected endpoints
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.method === 'POST' && request.url === '/api/chat') {
      const isValid = await verifyRequest(request, reply);
      if (!isValid) {
        return; // Reply already sent by verifyRequest
      }
    }
  });

  fastify.post<{ Body: ChatRequest }>(
    '/api/chat',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
          keyGenerator: request => {
            return `${request.ip}-${request.headers['user-agent']}`;
          },
          errorResponseBuilder: (
            req: FastifyRequest,
            context: errorResponseBuilderContext
          ): ErrorResponse => ({
            code: 429,
            error: 'Too Many Requests',
            expiresIn: context.ttl,
            message: `Rate limit exceeded, retry in ${context.after}`,
          }),
        } as RateLimitOptions,
      },
    },
    async (request, reply) => {
      const { messages, model, agents, tools, reasoning } = request.body;

      const modelConfig = getModel(model);

      if (!modelConfig) {
        return reply.status(400).send({ error: 'Invalid model' });
      }

      const inferenceUrl = `${modelConfig.INFERENCE_URL}/v1/chat/completions`;
      const agentsUrl = `${modelConfig.INFERENCE_URL}/v1/agents/heroku`;
      const systemPrompt = config.system_prompt;

      // Build tools list from new format (tools) or legacy format (agents)
      const selectedTools: SelectedTool[] = [];

      // Handle new tools format (includes both heroku_tool and mcp types)
      if (tools && tools.length > 0) {
        selectedTools.push(...tools);
      }

      // Handle legacy agents format (all heroku_tool type)
      if (agents && agents.length > 0) {
        for (const agentId of agents) {
          const tool = getTool(agentId);
          if (tool) {
            selectedTools.push({ type: tool.type as 'heroku_tool' | 'mcp', name: tool.name });
          }
        }
      }

      const hasTools = selectedTools.length > 0;

      const body: ChatRequestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
      };

      if (hasTools) {
        body.tools = selectedTools.map(tool => ({
          type: tool.type,
          name: tool.name,
          ...(tool.runtime_params && { runtime_params: tool.runtime_params }),
        }));
      } else {
        body.stream = true;
        if (model === 'claude-3-7-sonnet' && reasoning) {
          body.extended_thinking = {
            enabled: true,
            budget_tokens: 2000,
            include_reasoning: true,
          };
        }
      }

      try {
        const response = await fetch(hasTools ? agentsUrl : inferenceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelConfig.API_KEY}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          fastify.log.error(errorData, 'Error from model');
          return reply.status(response.status).send({
            error: 'Failed to fetch from model',
            details: errorData.error.message,
          });
        }

        if (!response.body) {
          return reply.status(500).send({ error: 'No response body received' });
        }

        return response.body;
      } catch (error) {
        request.log.error(error, 'Stream error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return reply.status(500).send({ error: 'Internal server error', details: errorMessage });
      }
    }
  );
};
