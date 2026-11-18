import { NextRequest, NextResponse } from "next/server";
import { CLEARANCEFLOW_MCP_TOOLS, executeMCPTool } from "../../../mcp/tools";

// GET /api/mcp -> Return list of MCP tools
export async function GET() {
  return NextResponse.json({
    name: "clearanceflow-customs-mcp",
    version: "1.0.0",
    tools: CLEARANCEFLOW_MCP_TOOLS,
  });
}

// POST /api/mcp -> Execute tool
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tool, arguments: args } = body;

    if (action === "tools/list") {
      return NextResponse.json({ tools: CLEARANCEFLOW_MCP_TOOLS });
    }

    if (action === "tools/call" || tool) {
      const toolName = tool || body.name;
      const toolArgs = args || body.parameters || {};

      const start = performance.now();
      const result = await executeMCPTool(toolName, toolArgs);
      const latencyMs = Number((performance.now() - start).toFixed(2));

      return NextResponse.json({
        success: true,
        tool: toolName,
        arguments: toolArgs,
        result,
        latencyMs,
      });
    }

    return NextResponse.json({ error: "Invalid MCP action or missing tool parameter." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
