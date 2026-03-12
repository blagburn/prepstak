# PrepStak — Claude Code Project Prompt

## What This Document Is

Use this prompt when starting a new Claude Code session in your `prepstak` directory. It contains all the context, decisions, and architecture from the planning conversations so Claude Code can pick up where we left off.

---

## Project Overview

**PrepStak** is an open-source MCP (Model Context Protocol) server that connects AI assistants like Claude, ChatGPT, and Gemini to a structured toolkit built for K-12 educators. Teachers can browse state learning standards, build unit workspaces, and run expert AI skills — lesson planning, assessment generation, rubric creation, differentiation, and more — all personalized to their grade level, subject, and students.

**Built by a teacher, for teachers.**

- **GitHub:** github.com/prepstak (display name: PrepStak)
- **License:** MIT
- **Status:** Pre-MVP, open-source summer project
- **Creator:** Matt Blagburn — secondary educator (science, math, technology), TAPPS baseball coach, with extensive experience in sales, marketing, business operations, and finance. Currently building ChampionCore (athletic scheduling SaaS for TAPPS schools) in parallel.

---

## Architecture — The Ideabrowser Blueprint

PrepStak is modeled directly on Ideabrowser (ideabrowser.com), an MCP-based startup idea discovery and validation platform. The architecture maps as follows:

| Ideabrowser Concept | PrepStak Equivalent |
|---|---|
| Idea Database (1,000+ startup ideas) | **Standards Database** (TEKS standards, browsable/searchable by grade, subject, strand) |
| Founder Profile (skills, budget, goals) | **Teacher Profile** (grade level, subject, school type, student demographics, teaching philosophy, state, available tech) |
| Projects (workspaces per idea) | **Unit Workspaces** (per standard/unit topic, collects all generated assets) |
| Skills (expert AI workflows) | **Educator AI Skills** (lesson plans, assessments, rubrics, differentiation, etc.) |
| Research (competitive analysis, market data) | **Pedagogical Research** (evidence-based strategies, cross-curricular connections, real-world applications) |
| Context Files (brand voice, tech stack) | **Teaching Context Files** (district pacing guides, classroom norms, textbook alignment, student reading levels, grading policies) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| MCP Server | TypeScript (using `@modelcontextprotocol/sdk`) |
| Database | Supabase (PostgreSQL + Auth + Real-time) |
| Hosting | Vercel (MCP server as API routes in Next.js) OR Cloudflare Workers |
| Framework | Next.js + Tailwind CSS (if standalone frontend is built later) |
| Development | AI-assisted (Claude Code) |

### MCP Compatibility

PrepStak will work as a remote MCP server accessible by:
- Claude (claude.ai, Claude Desktop, Claude Code) — native MCP support
- ChatGPT (desktop app) — adopted MCP March 2025
- Gemini — confirmed MCP support
- Cursor, VS Code, Windsurf — all support MCP
- Any MCP-compatible client via Streamable HTTP transport

The server should support the Streamable HTTP transport (current MCP spec standard) with OAuth 2.1 for authenticated access.

---

## Database Schema (Supabase/PostgreSQL)

### Core Tables

```sql
-- Learning standards (start with Texas TEKS, grades 6-12, science + math)
standards (
  id UUID PRIMARY KEY,
  state TEXT NOT NULL,              -- e.g., 'TX'
  framework TEXT NOT NULL,          -- e.g., 'TEKS'
  subject TEXT NOT NULL,            -- e.g., 'Science', 'Mathematics'
  course TEXT,                      -- e.g., 'Biology', 'Algebra I'
  grade_level TEXT NOT NULL,        -- e.g., '8', '9-12', 'K-5'
  strand TEXT,                      -- e.g., 'Force and Motion', 'Algebraic Reasoning'
  standard_code TEXT NOT NULL,      -- e.g., '8.6.A'
  description TEXT NOT NULL,
  keywords TEXT[],                  -- searchable tags
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Teacher profiles
teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  grade_levels TEXT[],              -- e.g., ['6', '7', '8']
  subjects TEXT[],                  -- e.g., ['Science', 'Math']
  school_type TEXT,                 -- 'public', 'private', 'charter', 'homeschool'
  school_name TEXT,
  district TEXT,
  state TEXT DEFAULT 'TX',
  student_demographics JSONB,      -- ELL %, SPED %, free lunch %, etc.
  teaching_philosophy TEXT,
  available_tech TEXT[],            -- e.g., ['Chromebooks', 'smartboard', 'Google Classroom']
  special_programs TEXT[],          -- e.g., ['AP', 'IB', 'dual enrollment', 'SPED inclusion']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Unit/Lesson workspaces
projects (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(id),
  title TEXT NOT NULL,
  standard_ids UUID[],              -- linked standards
  subject TEXT,
  grade_level TEXT,
  unit_topic TEXT,
  status TEXT DEFAULT 'active',     -- 'active', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Generated assets within a project
project_assets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  skill_id TEXT,                    -- which skill generated this
  asset_type TEXT NOT NULL,         -- 'lesson_plan', 'assessment', 'rubric', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,            -- the generated content (markdown)
  metadata JSONB,                   -- skill-specific metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Skill definitions
skills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'planning', 'assessment', 'differentiation', 'communication', 'content'
  when_to_use TEXT,
  estimated_time TEXT,
  prompt_template TEXT NOT NULL,    -- the expert system prompt
  produces TEXT[],                  -- asset types this skill creates
  source TEXT DEFAULT 'library',    -- 'library' or 'custom'
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Reusable teaching context files
context_files (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(id),
  project_id UUID,                  -- NULL = global, otherwise project-scoped
  title TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'pacing', 'norms', 'textbook', 'reading_levels', 'grading'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## MCP Tools to Implement

These are the tools the MCP server exposes to AI clients. Model them after Ideabrowser's tool architecture.

### Phase 1 — MVP Tools

1. **browse_standards** — Search and filter standards by state, subject, grade level, strand, keywords. Returns paginated results.
2. **get_teacher_profile** — Returns the authenticated teacher's profile and active context files.
3. **update_teacher_profile** — Update profile fields.
4. **create_project** — Start a new unit workspace linked to specific standards.
5. **list_projects** — List all teacher's projects with summary info.
6. **get_project_context** — Get full project details including linked standards, generated assets, and context files.
7. **list_skills** — List all available skills grouped by category with descriptions and recommendations.
8. **run_skill** — Execute a skill on a project. Assembles the expert prompt with teacher profile + project context + context files and returns it for AI execution.
9. **save_context_file** — Create or update a reusable context file (pacing guide, classroom norms, etc.).
10. **list_context_files** — List context files, optionally filtered by project.

### Phase 2 — Enhancement Tools

- **get_standard_details** — Deep info on a specific standard including cross-curricular connections
- **save_asset** — Save a generated asset to a project
- **search_assets** — Search across all generated assets
- **share_project** — Generate a shareable link to a project's assets (read-only)

---

## Skills to Build (Phase 1 — Launch with 6 Core Skills)

Each skill is an expert-prompted AI workflow. The prompt template gets assembled with the teacher's profile, project context, and relevant context files before execution.

### Planning Category
1. **Lesson Plan Builder** — Generates a complete, standards-aligned lesson plan with learning objectives, activities, formative checks, materials, and timing. Differentiates by default based on teacher profile data.
2. **Unit Plan Architect** — Creates a multi-week unit plan with scope, sequence, pacing, and assessment schedule aligned to selected standards.

### Assessment Category
3. **Assessment Generator** — Creates standards-aligned assessments (formative or summative). Supports multiple question types: multiple choice, short answer, constructed response, performance tasks. Includes answer key and scoring guide.
4. **Rubric Creator** — Builds detailed rubrics for any assignment type with clear performance levels, criteria descriptions, and point allocations.

### Differentiation Category
5. **Accommodation Adapter** — Takes any existing lesson plan or assessment and generates IEP/504/ELL/gifted modifications. Suggests scaffolds, modifications, and extensions.

### Communication Category
6. **Parent Communication Drafter** — Generates professional parent emails for common scenarios: progress updates, behavior concerns, upcoming unit previews, conference summaries.

### Skill Prompt Template Pattern

Each skill prompt should follow this structure (mirroring Ideabrowser's pattern):

```
You are an expert [role] with [X] years of experience in K-12 education.

## Your Task
[Specific task description]

## Teacher Context
[Injected from teacher_profile + context_files]
- Grade Level: {grade_levels}
- Subject: {subjects}
- School Type: {school_type}
- Student Demographics: {student_demographics}
- Teaching Philosophy: {teaching_philosophy}
- Available Technology: {available_tech}

## Project Context
[Injected from project + linked standards]
- Unit Topic: {unit_topic}
- Standards: {standard_codes_and_descriptions}
- Existing Assets: {list of already-generated assets in this project}

## Active Context Files
[Injected content from relevant context_files]

## Output Requirements
[Specific format, sections, and quality requirements for the output]

## Quality Standards
- All content must be standards-aligned (cite specific standard codes)
- Differentiation must be embedded, not an afterthought
- Activities must be practical and implementable with stated available technology
- Time estimates must be realistic for the stated grade level
- Language must be grade-appropriate for students
```

---

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
├── .env.example
├── package.json
├── tsconfig.json
├── LICENSE                    # MIT
├── README.md
└── CONTRIBUTING.md
```

---

## Phase 1 Development Plan (Summer Build — 8-12 Weeks)

**Weeks 1-2: Foundation**
- Initialize repo with TypeScript, MCP SDK, Supabase client
- Set up Supabase project with schema migrations
- Parse TEKS standards (science + math, grades 6-12) into seed data
- Implement browse_standards tool

**Weeks 3-4: Teacher Profile + Projects**
- Implement teacher profile tools (get/update)
- Implement project tools (create/list/get context)
- Implement context file tools (save/list)
- Set up auth flow

**Weeks 5-6: Skills Engine**
- Build skill prompt assembly system (context-builder)
- Implement first 3 skills: Lesson Plan Builder, Assessment Generator, Rubric Creator
- Implement list_skills and run_skill tools
- Test with real lesson scenarios

**Weeks 7-8: Remaining Skills + Polish**
- Implement remaining 3 skills: Unit Plan Architect, Accommodation Adapter, Parent Communication Drafter
- Write comprehensive README with setup instructions
- Write CONTRIBUTING.md for open-source contributors
- Test end-to-end with Claude, ChatGPT, and Gemini
- Recruit teacher beta testers from Matt's school/network

---

## Key Design Principles

1. **Teacher language, not developer language.** Tools and outputs should use words teachers use: "prep," "unit," "formative," "scaffold," "accommodation" — not "workflow," "pipeline," "module."

2. **Standards-first.** Everything anchors to learning standards. This is what makes PrepStak different from asking ChatGPT to "make me a lesson plan." Every output cites specific standard codes.

3. **Context-rich by default.** The teacher sets up their profile once and the system personalizes everything automatically. A Title I school with 40% ELL students gets fundamentally different outputs than a private school with AP classes.

4. **Open and portable.** MIT license, MCP protocol (works with any AI), Supabase (open-source database). No vendor lock-in anywhere.

5. **Built by a teacher.** Matt is a practicing secondary educator. Every skill output should be tested against the question: "Would I actually use this in my classroom tomorrow?"

---

## Getting Started (for Claude Code)

When starting a new session, begin by:

1. Check the current state of the repo: `ls -la` and `cat package.json` (if it exists)
2. If the repo is empty, start with initialization:
   - `npm init` with project name `prepstak`
   - Install core dependencies: `@modelcontextprotocol/sdk`, `@supabase/supabase-js`, `typescript`, `tsx`
   - Set up `tsconfig.json`
   - Create the directory structure above
   - Create a basic MCP server entry point with one working tool (browse_standards as a stub)
3. If the repo already has code, read the existing files to understand current state before making changes.

---

## Budget and Constraints

- **Budget:** $5K-$25K total, but most of that goes to ChampionCore. PrepStak should run on free tiers as long as possible.
- **Time:** Evenings and weekends during school year; more intensive during summer break.
- **Hosting costs:** Supabase free tier + Vercel free tier for early development. Main ongoing cost will be AI API calls once users are active (~$200-500/month at scale).
- **Starting scope:** Texas TEKS only, science + math only, grades 6-12 only. Expand to other states/subjects/grades after validation.
