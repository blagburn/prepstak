---
name: add-standards
description: Create a new learning standards data file (TEKS or other state standards) with the correct JSON schema for seeding into Supabase.
argument-hint: "[filename]"
---

Create a new standards data file at `data/teks/$ARGUMENTS.json` (or an appropriate subdirectory for non-Texas standards).

## Schema

Each file is a JSON array of objects. Every object MUST have exactly these fields:

```json
{
  "state": "TX",
  "framework": "TEKS",
  "subject": "Science",
  "course": "Biology",
  "grade_level": "9-12",
  "strand": "Cell Structure and Function",
  "standard_code": "Bio.4.A",
  "description": "Compare and contrast prokaryotic and eukaryotic cells, including their complexity, and compare and contrast scientific explanations for cellular complexity.",
  "keywords": ["cells", "prokaryotic", "eukaryotic", "cell structure"]
}
```

Field rules:
- **state** — 2-letter abbreviation (e.g. "TX")
- **framework** — standards framework name (e.g. "TEKS", "NGSS", "CCSS")
- **subject** — "Science" or "Mathematics" (capitalized)
- **course** — course name for high school (e.g. "Biology", "Algebra I"), or `null` for middle school grade-level courses
- **grade_level** — "6", "7", "8", or "9-12"
- **strand** — topic strand within the course (e.g. "Force and Motion", "Algebraic Reasoning"), or `null` if not applicable
- **standard_code** — must be UNIQUE across all files (this is the upsert key)
- **description** — full text of what students should know/be able to do
- **keywords** — array of lowercase searchable tags

## Reference existing files

Look at existing files in `data/teks/` for format examples. Match the style and level of detail.

## Steps

1. Create the JSON file with standards data
2. Validate the JSON is parseable (no trailing commas, correct quoting)
3. Verify all `standard_code` values are unique within the file
4. Report the count of standards created
5. Remind the user to run `npm run seed` to load into Supabase

## Important

- Standard codes must be unique across ALL data files (the seed script upserts on `standard_code`)
- Use realistic, accurate standard descriptions — teachers will see these
- Include good keywords for search — think about what a teacher would type to find this standard
