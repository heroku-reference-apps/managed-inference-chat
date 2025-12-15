/**
 * MCP Server and Tool types based on Heroku Inference API /v1/mcp/servers response
 */

export interface MCPToolInputSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[] | null;
}

export interface MCPToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface MCPTool {
  name: string;
  namespaced_name: string;
  description?: string;
  input_schema: MCPToolInputSchema;
  annotations?: MCPToolAnnotations;
}

export interface MCPServer {
  id: string;
  app_id: string;
  process_type: string;
  process_command: string;
  namespace: string;
  server_status: string;
  primitives_status: string;
  tools: MCPTool[];
  created_at: string;
  updated_at: string;
}

/**
 * The API returns an array of MCPServer objects directly
 */
export type MCPServersResponse = MCPServer[];

/**
 * Flattened MCP tool for frontend consumption
 */
export interface MCPToolFlat {
  id: string;
  name: string;
  serverNamespace: string;
  description?: string;
}

export interface MCPToolsResponse {
  tools: MCPToolFlat[];
}
