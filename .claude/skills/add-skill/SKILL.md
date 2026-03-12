---
name: add-skill
description: Scaffold a new PrepStak educator skill with prompt template. Use when adding a new AI skill for teachers (e.g. a vocabulary builder, lab report helper, etc.)
argument-hint: "[skill-id] [category]"
---

Create a new PrepStak educator skill based on the arguments provided.

- **$0** is the skill ID (kebab-case, e.g. `vocabulary-builder`)
- **$1** is the category: `planning`, `assessment`, `differentiation`, `communication`, or `content`

## Steps

### 1. Create the skill file

Create `src/skills/$0.ts` following the exact pattern used in `src/skills/lesson-plan.ts`.

The file must export a `SkillDefinition` object (imported from `../types/index.js`) with these fields:
- `id` — matches the filename / $0
- `title` — human-readable name
- `description` — what the skill does, written for teachers
- `category` — must be $1
- `whenToUse` — guidance on when a teacher should run this skill
- `estimatedTime` — realistic estimate
- `produces` — array of `AssetType` values this skill generates
- `promptTemplate` — the full expert prompt

### 2. Prompt template requirements

The `promptTemplate` string MUST include all 4 placeholders:
```
{{teacherContext}}
{{projectContext}}
{{contextFiles}}
{{additionalInstructions}}
```

The prompt must:
- Open with an expert role statement (e.g. "You are an expert...")
- Include "## Teacher Context", "## Project Context", "## Active Context Files" sections with the matching placeholders
- Include "## Output Requirements" with specific, structured output sections
- Include "## Quality Standards" requiring TEKS standard code citations
- Use teacher language — "prep," "unit," "formative," "scaffold," "accommodation" — never "workflow," "pipeline," "module"

### 3. Register in the skill registry

Edit `src/skills/index.ts`:
1. Add an import for the new skill's export
2. Add it to the `skillRegistry` object using `[newSkill.id]: newSkill`

### 4. Verify

Run `npx tsc --noEmit` to confirm the new skill compiles without errors.

Report the skill ID so the user can test it with `run_skill`.
