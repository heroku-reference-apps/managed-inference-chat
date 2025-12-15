import { FastifyPluginAsync } from 'fastify';
import { getModel } from '../lib/config.js';
import { MCPServersResponse, MCPToolFlat, MCPToolsResponse } from '../types/mcp.js';

interface McpServersQuery {
  model?: string;
}

export const mcpRoute: FastifyPluginAsync = async fastify => {
  /**
   * GET /api/mcp/servers
   * Proxies request to Heroku Inference API to get list of MCP servers and their tools.
   * Returns flattened list of tools with server namespace for frontend consumption.
   * Query params:
   *   - model: The model ID to fetch MCP servers for (required)
   */
  fastify.get<{ Querystring: McpServersQuery }>('/api/mcp/servers', async (request, reply) => {
    try {
      const { model } = request.query;

      if (!model) {
        request.log.warn('No model specified for MCP servers request');
        return reply.send({ tools: [] });
      }

      const modelConfig = getModel(model);

      if (!modelConfig || !('INFERENCE_URL' in modelConfig) || !modelConfig.INFERENCE_URL) {
        request.log.warn({ model }, 'Model not found or has no inference URL');
        return reply.send({ tools: [] });
      }

      const mcpUrl = `${modelConfig.INFERENCE_URL}/v1/mcp/servers`;

      const response = await fetch(mcpUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${modelConfig.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        request.log.error(
          { status: response.status, error: errorText },
          'MCP servers fetch failed'
        );
        // Return empty array on error to allow graceful degradation
        return reply.send({ tools: [] });
      }

      const servers: MCPServersResponse = await response.json();

      // Flatten the server/tool hierarchy for frontend consumption
      const tools: MCPToolFlat[] = [];

      for (const server of servers || []) {
        for (const tool of server.tools || []) {
          tools.push({
            id: tool.namespaced_name,
            name: tool.name,
            serverNamespace: server.namespace,
            description: tool.description,
          });
        }
      }

      const result: MCPToolsResponse = { tools };
      return reply.send(result);
    } catch (error) {
      request.log.error(error, 'Error fetching MCP servers');
      // Return empty array on error to allow graceful degradation
      return reply.send({ tools: [] });
    }
  });
};
