import { useEffect, useState } from 'react';
import type { MCPTool, MCPToolsResponse, ModelType } from '@/types/chat';

export const useMcpServers = (model: ModelType) => {
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetching for image generation model
    if (model === 'stable-image-ultra') {
      setMcpTools([]);
      setLoading(false);
      return;
    }

    const fetchMcpServers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/mcp/servers?model=${encodeURIComponent(model)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch MCP servers');
        }
        const data: MCPToolsResponse = await response.json();
        setMcpTools(data.tools || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Return empty array on error for graceful degradation
        setMcpTools([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMcpServers();
  }, [model]);

  return { mcpTools, loading, error };
};
