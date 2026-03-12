# Contributing to PrepStak

Thanks for your interest in contributing! PrepStak is built by educators, for educators.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/prepstak.git`
3. Install dependencies: `npm install`
4. Set up Supabase (see README)
5. Run the dev server: `npm run dev`

## Development

```bash
# Type check
npm run typecheck

# Start dev server
npm run dev

# Seed standards data
npm run seed
```

## Code Conventions

- **Teacher language.** Use words teachers use: "prep," "unit," "formative," "scaffold," "accommodation." Not "workflow," "pipeline," "module."
- **Standards-first.** Every skill output must reference specific TEKS standard codes.
- **TypeScript strict mode.** No `any` types, no `@ts-ignore`.

## Adding a New Skill

1. Create a file in `src/skills/` following the existing pattern
2. Export a `SkillDefinition` object
3. Register it in `src/skills/index.ts`
4. The skill will automatically appear in `list_skills` and be runnable via `run_skill`

## Adding Standards for a New State

1. Create JSON files in `data/` following the TEKS format
2. Update the seed script if needed
3. Submit a PR with the data source documented

## Pull Requests

- Keep PRs focused on one thing
- Include a description of what you changed and why
- Make sure `npm run typecheck` passes

## Questions?

Open an issue or reach out to Matt Blagburn.
