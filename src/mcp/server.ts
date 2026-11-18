#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CLEARANCEFLOW_MCP_TOOLS, executeMCPTool } from "./tools.js";

async function runMCPServer() {
  const server = new Server(
    {
      name: "clearanceflow-customs-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: CLEARANCEFLOW_MCP_TOOLS,
    };
  });

  // Call a tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = await executeMCPTool(name, args || {});
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing tool '${name}': ${err.message}`,
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ClearanceFlow MCP Server running on stdio transport.");
}

runMCPServer().catch((err) => {
  console.error("Fatal error starting ClearanceFlow MCP Server:", err);
  process.exit(1);
});
