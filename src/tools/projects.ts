import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServiceClient } from '../lib/supabase.js';
import type { Project, Standard, ProjectAsset, ContextFile } from '../types/index.js';

export function registerProjectTools(server: McpServer): void {
  server.tool(
    'create_project',
    'Start a new unit workspace. Link it to specific TEKS standards so every skill output in this project is automatically aligned. Think of it as your prep folder for a unit.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      title: z.string().describe('Project title, e.g. "8th Grade Force & Motion Unit"'),
      standard_ids: z.array(z.string().uuid()).optional().describe('IDs of standards to link (from browse_standards)'),
      subject: z.string().optional().describe('Subject area'),
      grade_level: z.string().optional().describe('Grade level'),
      unit_topic: z.string().optional().describe('Unit topic description'),
    },
    async ({ teacher_id, title, standard_ids, subject, grade_level, unit_topic }) => {
      const supabase = createServiceClient();

      const { data, error } = await supabase
        .from('projects')
        .insert({
          teacher_id,
          title,
          standard_ids: standard_ids ?? [],
          subject,
          grade_level,
          unit_topic,
        })
        .select()
        .single();

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error creating project: ${error.message}` }], isError: true };
      }

      const project = data as Project;

      let standardsSummary = '';
      if (standard_ids && standard_ids.length > 0) {
        const { data: standards } = await supabase
          .from('standards')
          .select('standard_code, description')
          .in('id', standard_ids);

        if (standards && standards.length > 0) {
          standardsSummary = '\n\n**Linked Standards:**\n' +
            (standards as Pick<Standard, 'standard_code' | 'description'>[])
              .map((s) => `- ${s.standard_code}: ${s.description}`)
              .join('\n');
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: `Unit workspace created: **${project.title}** (ID: ${project.id})${standardsSummary}\n\nYou can now run skills against this project — they'll automatically include your linked standards and profile context.`,
        }],
      };
    }
  );

  server.tool(
    'list_projects',
    'List all your unit workspaces. Shows project titles, linked standards count, and status.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      status: z.enum(['active', 'archived']).optional().describe('Filter by status (default: all)'),
    },
    async ({ teacher_id, status }) => {
      const supabase = createServiceClient();

      let q = supabase
        .from('projects')
        .select('*')
        .eq('teacher_id', teacher_id)
        .order('updated_at', { ascending: false });

      if (status) q = q.eq('status', status);

      const { data, error } = await q;

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error listing projects: ${error.message}` }], isError: true };
      }

      const projects = (data ?? []) as Project[];

      if (projects.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: 'No unit workspaces yet. Use **create_project** to start your first one — link it to TEKS standards and all your skill outputs will be aligned automatically.',
          }],
        };
      }

      const lines = projects.map((p) =>
        `- **${p.title}** (${p.status})\n  ID: ${p.id}\n  ${p.subject ? `Subject: ${p.subject} | ` : ''}${p.grade_level ? `Grade: ${p.grade_level} | ` : ''}Standards linked: ${p.standard_ids.length}`
      );

      return {
        content: [{ type: 'text' as const, text: `## Your Unit Workspaces (${projects.length})\n\n${lines.join('\n\n')}` }],
      };
    }
  );

  server.tool(
    'get_project_context',
    'Get full details for a unit workspace: linked standards (with descriptions), generated assets, and project-scoped context files. This is what gets assembled into skill prompts.',
    {
      project_id: z.string().uuid().describe('The project ID'),
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
    },
    async ({ project_id, teacher_id }) => {
      const supabase = createServiceClient();

      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .eq('teacher_id', teacher_id)
        .single();

      if (projectError || !project) {
        return { content: [{ type: 'text' as const, text: `Project not found or access denied.` }], isError: true };
      }

      const p = project as Project;

      // Fetch linked standards, assets, and context files in parallel
      const [standardsRes, assetsRes, contextRes] = await Promise.all([
        p.standard_ids.length > 0
          ? supabase.from('standards').select('*').in('id', p.standard_ids)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('project_assets')
          .select('id, skill_id, asset_type, title, created_at')
          .eq('project_id', project_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('context_files')
          .select('id, title, category, updated_at')
          .eq('teacher_id', teacher_id)
          .eq('project_id', project_id)
          .order('updated_at', { ascending: false }),
      ]);

      const standards = (standardsRes.data ?? []) as Standard[];
      const assets = (assetsRes.data ?? []) as Pick<ProjectAsset, 'id' | 'skill_id' | 'asset_type' | 'title' | 'created_at'>[];
      const contextFiles = (contextRes.data ?? []) as Pick<ContextFile, 'id' | 'title' | 'category' | 'updated_at'>[];

      const sections = [
        `## ${p.title}`,
        `- **Subject:** ${p.subject ?? 'Not set'}`,
        `- **Grade Level:** ${p.grade_level ?? 'Not set'}`,
        `- **Unit Topic:** ${p.unit_topic ?? 'Not set'}`,
        `- **Status:** ${p.status}`,
      ];

      if (standards.length > 0) {
        sections.push('', '### Linked Standards', '');
        standards.forEach((s) =>
          sections.push(`- **${s.standard_code}**: ${s.description}${s.strand ? ` _(${s.strand})_` : ''}`)
        );
      }

      if (assets.length > 0) {
        sections.push('', '### Generated Assets', '');
        assets.forEach((a) =>
          sections.push(`- ${a.title} (${a.asset_type}) — ${new Date(a.created_at).toLocaleDateString()}`)
        );
      } else {
        sections.push('', '_No assets generated yet. Run a skill to create your first one._');
      }

      if (contextFiles.length > 0) {
        sections.push('', '### Project Context Files', '');
        contextFiles.forEach((f) => sections.push(`- ${f.title} (${f.category})`));
      }

      return { content: [{ type: 'text' as const, text: sections.join('\n') }] };
    }
  );
}
