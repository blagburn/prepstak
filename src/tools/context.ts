import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServiceClient } from '../lib/supabase.js';
import type { ContextFile } from '../types/index.js';

export function registerContextTools(server: McpServer): void {
  server.tool(
    'save_context_file',
    'Save a reusable teaching context file — like a pacing guide, classroom norms, textbook alignment, student reading levels, or grading policy. These get automatically injected into every skill you run, so the AI always knows your classroom context.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      project_id: z.string().uuid().optional().describe('Link to a specific project (omit for global context that applies to all projects)'),
      title: z.string().describe('Context file title, e.g. "Q3 Pacing Guide" or "Classroom Norms"'),
      category: z.enum(['pacing', 'norms', 'textbook', 'reading_levels', 'grading', 'general']).describe('Category of context'),
      content: z.string().describe('The context content — paste your pacing guide, norms, reading level data, etc.'),
    },
    async ({ teacher_id, project_id, title, category, content }) => {
      const supabase = createServiceClient();

      // Check for existing context file with same title+teacher+project to update
      const { data: existing } = await supabase
        .from('context_files')
        .select('id')
        .eq('teacher_id', teacher_id)
        .eq('title', title)
        .is('project_id', project_id ?? null)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('context_files')
          .update({ content, category, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('context_files')
          .insert({ teacher_id, project_id: project_id ?? null, title, category, content })
          .select()
          .single();
      }

      if (result.error) {
        return { content: [{ type: 'text' as const, text: `Error saving context file: ${result.error.message}` }], isError: true };
      }

      const cf = result.data as ContextFile;
      const scope = project_id ? 'project' : 'global';
      const action = existing ? 'Updated' : 'Saved';

      return {
        content: [{
          type: 'text' as const,
          text: `${action} ${scope} context file: **${cf.title}** (${cf.category})\n\nThis context will be automatically included in skill prompts${scope === 'project' ? ' for this project' : ' across all your projects'}.`,
        }],
      };
    }
  );

  server.tool(
    'list_context_files',
    'List your saved context files. Shows global files and optionally project-specific ones.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      project_id: z.string().uuid().optional().describe('Filter to a specific project\'s context files'),
      category: z.enum(['pacing', 'norms', 'textbook', 'reading_levels', 'grading', 'general']).optional().describe('Filter by category'),
    },
    async ({ teacher_id, project_id, category }) => {
      const supabase = createServiceClient();

      let q = supabase
        .from('context_files')
        .select('*')
        .eq('teacher_id', teacher_id)
        .order('updated_at', { ascending: false });

      if (project_id) {
        // Show project-specific + global files
        q = q.or(`project_id.eq.${project_id},project_id.is.null`);
      }

      if (category) q = q.eq('category', category);

      const { data, error } = await q;

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error listing context files: ${error.message}` }], isError: true };
      }

      const files = (data ?? []) as ContextFile[];

      if (files.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: 'No context files saved yet. Use **save_context_file** to store things like your pacing guide, classroom norms, or student reading levels. These get automatically included in every skill you run.',
          }],
        };
      }

      const global = files.filter((f) => !f.project_id);
      const projectScoped = files.filter((f) => f.project_id);

      const sections: string[] = [];

      if (global.length > 0) {
        sections.push('### Global Context Files\n');
        global.forEach((f) =>
          sections.push(`- **${f.title}** (${f.category}) — updated ${new Date(f.updated_at).toLocaleDateString()}\n  ID: ${f.id}`)
        );
      }

      if (projectScoped.length > 0) {
        sections.push('\n### Project Context Files\n');
        projectScoped.forEach((f) =>
          sections.push(`- **${f.title}** (${f.category}) — updated ${new Date(f.updated_at).toLocaleDateString()}\n  ID: ${f.id}`)
        );
      }

      return {
        content: [{ type: 'text' as const, text: sections.join('\n') }],
      };
    }
  );
}
