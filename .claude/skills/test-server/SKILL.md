---
name: test-server
description: Start the PrepStak MCP server, verify all tools register correctly via tools/list, then shut down. Use after making changes to tools or server.ts.
---

Smoke-test the PrepStak MCP server by starting it, calling the MCP protocol endpoints, and verifying all tools are registered.

## Steps

### 1. Clean up port
Kill any existing process on port 3001:
```bash
lsof -ti:3001 | xargs kill 2>/dev/null; echo "port cleared"
```

### 2. Start server in background
```bash
npx tsx src/server.ts &
sleep 2
```

### 3. Test MCP initialize
```bash
curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}'
```

Confirm the response contains `"serverInfo":{"name":"prepstak"}`.

### 4. Test tools/list
```bash
curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

### 5. Verify all expected tools

Check that the tools/list response includes ALL of these tool names:
- `browse_standards`
- `get_teacher_profile`
- `update_teacher_profile`
- `create_project`
- `list_projects`
- `get_project_context`
- `save_context_file`
- `list_context_files`
- `list_skills`
- `run_skill`

### 6. Test health endpoint
```bash
curl -s http://localhost:3001/health
```

### 7. Shut down
```bash
lsof -ti:3001 | xargs kill 2>/dev/null
```

### 8. Report results

Summarize:
- Did the server start successfully?
- How many tools registered out of expected?
- List any missing tools
- Any errors in the output?
