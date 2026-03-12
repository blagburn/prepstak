# PrepStak — CLAUDE.md

## Project Summary

PrepStak is an open-source MCP (Model Context Protocol) server that connects AI assistants to a structured toolkit for K-12 educators. Teachers browse learning standards, build unit workspaces, and run expert AI skills — all personalized to their grade level, subject, and students.

Architecture is modeled on Ideabrowser (ideabrowser.com). See `PREPSTAK-CLAUDE-CODE-PROMPT.md` for full architecture mapping, database schema, and development plan.

## Tech Stack

- **Runtime:** TypeScript (Node.js)
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Database:** Supabase (PostgreSQL + Auth)
- **Transport:** Streamable HTTP with OAuth 2.1
- **Hosting:** Vercel or Cloudflare Workers
- **License:** MIT

## Project Structure

```
prepstak/
├── src/
│   ├── server.ts              # MCP server entry point
│   ├── tools/                 # MCP tool handlers
│   │   ├── standards.ts       # browse_standards, get_standard_details
│   │   ├── profile.ts         # get/update_teacher_profile
│   │   ├── projects.ts        # create/list/get project tools
│   │   ├── skills.ts          # list_skills, run_skill
│   │   └── context.ts         # save/list context files
│   ├── skills/                # Skill prompt templates
│   │   ├── lesson-plan.ts
│   │   ├── unit-plan.ts
│   │   ├── assessment.ts
│   │   ├── rubric.ts
│   │   ├── accommodation.ts
│   │   └── parent-comm.ts
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client + queries
│   │   ├── auth.ts            # OAuth / auth helpers
│   │   └── context-builder.ts # Assembles skill prompts with context
│   └── types/
│       └── index.ts           # TypeScript types
├── supabase/
│   └── migrations/            # Database migrations
├── data/
│   └── teks/                  # Parsed TEKS standards seed data
├── scripts/
│   └── seed-standards.ts      # Script to parse and seed TEKS into DB
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Key Commands

```bash
# Install dependencies
npm install

# Run MCP server locally (once implemented)
npx tsx src/server.ts

# Run database seed script
npx tsx scripts/seed-standards.ts

# TypeScript type checking
npx tsc --noEmit
```

## Database

Supabase PostgreSQL with these core tables:
- `standards` — Learning standards (TEKS, grades 6-12, science + math)
- `teacher_profiles` — Teacher info, demographics, philosophy, tech
- `projects` — Unit workspaces linked to standards
- `project_assets` — Generated content (lesson plans, assessments, etc.)
- `skills` — Skill definitions with prompt templates
- `context_files` — Reusable teaching context (pacing guides, norms, etc.)

Full schema is in `PREPSTAK-CLAUDE-CODE-PROMPT.md` and `supabase/migrations/`.

## MCP Tools (Phase 1)

1. `browse_standards` — Search/filter standards by state, subject, grade, strand, keywords
2. `get_teacher_profile` — Return authenticated teacher's profile + context files
3. `update_teacher_profile` — Update profile fields
4. `create_project` — Start a unit workspace linked to standards
5. `list_projects` — List teacher's projects
6. `get_project_context` — Full project details with standards, assets, context files
7. `list_skills` — List available skills by category
8. `run_skill` — Execute a skill with assembled context
9. `save_context_file` — Create/update reusable context files
10. `list_context_files` — List context files, optionally filtered by project

## Skills (Phase 1 — 6 Core)

| Skill | Category | Produces |
|---|---|---|
| Lesson Plan Builder | Planning | lesson_plan |
| Unit Plan Architect | Planning | unit_plan |
| Assessment Generator | Assessment | assessment |
| Rubric Creator | Assessment | rubric |
| Accommodation Adapter | Differentiation | accommodations |
| Parent Communication Drafter | Communication | parent_email |

## Conventions

- **Use teacher language, not developer language.** "Prep," "unit," "formative," "scaffold," "accommodation" — not "workflow," "pipeline," "module."
- **Standards-first.** Every output must cite specific standard codes (e.g., TEKS 8.6.A).
- **Context-rich by default.** Outputs are personalized based on teacher profile, student demographics, and context files.
- **Starting scope:** Texas TEKS only, science + math only, grades 6-12 only.
- **Keep costs minimal.** Use Supabase and Vercel free tiers. No paid services unless necessary.

## Environment Variables

```
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Store in `.env` (gitignored). See `.env.example` for template.

## Current Status

Pre-MVP. See `PREPSTAK-CLAUDE-CODE-PROMPT.md` for the full 8-12 week development plan.
