import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerStandardsTools } from './tools/standards.js';
import { registerProfileTools } from './tools/profile.js';
import { registerProjectTools } from './tools/projects.js';
import { registerContextTools } from './tools/context.js';
import { registerSkillTools } from './tools/skills.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'prepstak', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  registerStandardsTools(server);
  registerProfileTools(server);
  registerProjectTools(server);
  registerContextTools(server);
  registerSkillTools(server);

  return server;
}

const app = express();

// Parse JSON bodies for MCP requests
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  await server.connect(transport);

  await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  await transport.handleRequest(req, res);
});

app.delete('/mcp', async (_req, res) => {
  res.status(405).json({ error: 'Stateless server — no sessions to delete' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'prepstak', version: '0.1.0' });
});

app.listen(PORT, () => {
  console.log(`PrepStak MCP server running on http://localhost:${PORT}/mcp`);
});
