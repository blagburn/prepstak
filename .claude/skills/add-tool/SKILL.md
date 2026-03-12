---
name: add-tool
description: Scaffold a new PrepStak MCP tool handler. Use when adding a new tool that AI clients can call (e.g. search_assets, share_project, etc.)
argument-hint: "[tool-name]"
---

Create a new MCP tool called `$ARGUMENTS` for the PrepStak server.

## Steps

### 1. Decide file placement

- If the tool fits an existing category in `src/tools/` (standards, profile, projects, context, skills), add it to that file.
- If it's a new category, create a new file `src/tools/<category>.ts`.

### 2. Implement the tool handler

Follow the exact pattern in `src/tools/standards.ts`:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServiceClient } from '../lib/supabase.js';

export function registerXxxTools(server: McpServer): void {
  server.tool(
    'tool_name',
    'User-facing description written for teachers, not developers',
    {
      // Zod schema — every parameter MUST have .describe()
      param: z.string().describe('What this parameter is for'),
    },
    async ({ param }) => {
      const supabase = createServiceClient();
      // Implementation...
      return {
        content: [{ type: 'text' as const, text: 'Result text' }],
      };
    }
  );
}
```

Requirements:
- Use `createServiceClient()` from `src/lib/supabase.js` for database access
- Every Zod parameter must have `.describe()` with helpful text
- Tool description must use teacher language, not developer jargon
- Return `{ content: [{ type: 'text' as const, text: '...' }] }` format
- Set `isError: true` on error responses
- Use types from `src/types/index.ts` — add new types there if needed

### 3. Wire into the server (if new file)

If you created a new file, edit `src/server.ts`:
1. Add an import: `import { registerXxxTools } from './tools/xxx.js';`
2. Add the registration call: `registerXxxTools(server);` inside `createMcpServer()`

### 4. Verify

Run `npx tsc --noEmit` to confirm it compiles.

Report the tool name so the user can verify it appears in `tools/list`.
