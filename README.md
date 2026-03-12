# PrepStak

Open-source MCP server for K-12 educators. Browse learning standards, build unit workspaces, and run expert AI skills — all personalized to your classroom.

**Built by a teacher, for teachers.**

## What It Does

PrepStak connects AI assistants (Claude, ChatGPT, Gemini, Cursor, etc.) to a structured teaching toolkit via the [Model Context Protocol](https://modelcontextprotocol.io/). Instead of generic AI responses, every output is:

- **Standards-aligned** — cites specific TEKS codes
- **Personalized** — uses your teacher profile, student demographics, and classroom context
- **Structured** — follows proven instructional design frameworks

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/prepstak/prepstak.git
cd prepstak
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Seed standards data

```bash
npm run seed
```

### 4. Start the server

```bash
npm run dev
```

The MCP server runs at `http://localhost:3001/mcp`.

### 5. Connect your AI client

#### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "prepstak": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

#### Claude Code

```bash
claude mcp add prepstak http://localhost:3001/mcp
```

#### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "prepstak": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

## Tools

| Tool | Description |
|---|---|
| `browse_standards` | Search TEKS standards by subject, grade, course, strand, keywords |
| `get_teacher_profile` | View your profile and global context files |
| `update_teacher_profile` | Set up or update your teacher profile |
| `create_project` | Start a unit workspace linked to standards |
| `list_projects` | List your unit workspaces |
| `get_project_context` | Full project details with standards, assets, context files |
| `list_skills` | Browse available AI skills by category |
| `run_skill` | Run a skill — assembles your context into a personalized prompt |
| `save_context_file` | Save reusable context (pacing guides, norms, reading levels) |
| `list_context_files` | List your saved context files |

## Skills

| Skill | Category | What It Produces |
|---|---|---|
| Lesson Plan Builder | Planning | Complete lesson plans with 5E model, differentiation, formative checks |
| Unit Plan Architect | Planning | Multi-week unit plans with backward design, daily pacing |
| Assessment Generator | Assessment | Standards-aligned tests with answer keys and scoring guides |
| Rubric Creator | Assessment | Detailed rubrics with teacher and student-friendly versions |
| Accommodation Adapter | Differentiation | IEP/504/ELL/gifted modifications for any lesson or assessment |
| Parent Communication Drafter | Communication | Professional parent emails for any scenario |

## How It Works

1. **Set up your profile** — grade levels, subjects, student demographics, available tech
2. **Browse standards** — find the TEKS you're teaching
3. **Create a project** — link it to your standards
4. **Run skills** — PrepStak assembles your profile + standards + context into an expert prompt
5. **The AI generates** — standards-aligned, personalized content ready for your classroom

PrepStak never calls an AI API itself. It assembles context-rich prompts and returns them to your AI client for execution. Zero API costs for PrepStak.

## Current Scope

- **Standards:** Texas TEKS only
- **Subjects:** Science and Mathematics
- **Grades:** 6-12
- **Auth:** MVP uses explicit teacher_id (OAuth 2.1 coming in Phase 2)

## Tech Stack

- TypeScript + Node.js
- MCP SDK (`@modelcontextprotocol/sdk`)
- Supabase (PostgreSQL)
- Express (Streamable HTTP transport)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE).
