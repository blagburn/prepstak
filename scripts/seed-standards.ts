/**
 * Seed TEKS standards into Supabase from JSON data files.
 *
 * Usage: npx tsx scripts/seed-standards.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SECRET_KEY in .env
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment.');
  console.error('Copy .env.example to .env and fill in your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

interface StandardSeed {
  state: string;
  framework: string;
  subject: string;
  course: string | null;
  grade_level: string;
  strand: string | null;
  standard_code: string;
  description: string;
  keywords: string[];
}

async function seedFile(filePath: string): Promise<number> {
  const raw = readFileSync(filePath, 'utf-8');
  const standards: StandardSeed[] = JSON.parse(raw);

  if (standards.length === 0) {
    console.log(`  Skipping ${filePath} (empty)`);
    return 0;
  }

  // Upsert by standard_code to avoid duplicates
  const { error } = await supabase
    .from('standards')
    .upsert(standards, { onConflict: 'standard_code' });

  if (error) {
    console.error(`  Error seeding ${filePath}: ${error.message}`);
    return 0;
  }

  return standards.length;
}

async function main() {
  const dataDir = join(import.meta.dirname ?? '.', '..', 'data', 'teks');
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort();

  if (files.length === 0) {
    console.error(`No JSON files found in ${dataDir}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} TEKS data files.\n`);

  let total = 0;
  for (const file of files) {
    const filePath = join(dataDir, file);
    const count = await seedFile(filePath);
    console.log(`  ${file}: ${count} standards`);
    total += count;
  }

  console.log(`\nSeeded ${total} total standards.`);
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
