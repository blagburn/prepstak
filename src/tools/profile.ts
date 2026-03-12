import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServiceClient } from '../lib/supabase.js';
import type { TeacherProfile, ContextFile } from '../types/index.js';

export function registerProfileTools(server: McpServer): void {
  server.tool(
    'get_teacher_profile',
    'Returns the teacher\'s profile including grade levels, subjects, school info, student demographics, and global context files. If no profile exists yet, returns a helpful setup message.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
    },
    async ({ teacher_id }) => {
      const supabase = createServiceClient();

      const { data: profile, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacher_id)
        .maybeSingle();

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error fetching profile: ${error.message}` }], isError: true };
      }

      if (!profile) {
        return {
          content: [{
            type: 'text' as const,
            text: `No teacher profile found for this ID. Use the **update_teacher_profile** tool to set up your profile — it only takes a minute and makes every skill output personalized to your classroom.\n\nHere's what you can set:\n- Name\n- Grade levels (e.g., 6, 7, 8)\n- Subjects (e.g., Science, Mathematics)\n- School type (public, private, charter, homeschool)\n- School name & district\n- Student demographics (ELL %, SPED %, etc.)\n- Teaching philosophy\n- Available technology\n- Special programs (AP, IB, dual enrollment, etc.)`,
          }],
        };
      }

      // Fetch global context files
      const { data: contextFiles } = await supabase
        .from('context_files')
        .select('id, title, category, updated_at')
        .eq('teacher_id', teacher_id)
        .is('project_id', null)
        .order('updated_at', { ascending: false });

      const p = profile as TeacherProfile;
      const cf = (contextFiles ?? []) as Pick<ContextFile, 'id' | 'title' | 'category' | 'updated_at'>[];

      const sections = [
        `## Teacher Profile: ${p.name ?? 'Unnamed'}`,
        '',
        `- **Grade Levels:** ${p.grade_levels.join(', ') || 'Not set'}`,
        `- **Subjects:** ${p.subjects.join(', ') || 'Not set'}`,
        `- **School:** ${p.school_name ?? 'Not set'} (${p.school_type ?? 'type not set'})`,
        `- **District:** ${p.district ?? 'Not set'}`,
        `- **State:** ${p.state}`,
        `- **Teaching Philosophy:** ${p.teaching_philosophy ?? 'Not set'}`,
        `- **Available Tech:** ${p.available_tech.join(', ') || 'Not set'}`,
        `- **Special Programs:** ${p.special_programs.join(', ') || 'None'}`,
      ];

      if (p.student_demographics) {
        sections.push(`- **Student Demographics:** ${JSON.stringify(p.student_demographics)}`);
      }

      if (cf.length > 0) {
        sections.push('', '### Global Context Files', '');
        cf.forEach((f) => sections.push(`- ${f.title} (${f.category})`));
      }

      return { content: [{ type: 'text' as const, text: sections.join('\n') }] };
    }
  );

  server.tool(
    'update_teacher_profile',
    'Create or update the teacher profile. You can set any combination of fields — only provided fields are updated. This personalizes all skill outputs to your classroom.',
    {
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      name: z.string().optional().describe('Teacher\'s display name'),
      grade_levels: z.array(z.string()).optional().describe('Grade levels taught, e.g. ["6", "7", "8"]'),
      subjects: z.array(z.string()).optional().describe('Subjects taught, e.g. ["Science", "Mathematics"]'),
      school_type: z.string().optional().describe('School type: "public", "private", "charter", "homeschool"'),
      school_name: z.string().optional().describe('Name of the school'),
      district: z.string().optional().describe('School district'),
      state: z.string().optional().describe('State abbreviation, e.g. "TX"'),
      student_demographics: z.record(z.string(), z.unknown()).optional().describe('Student demographics as key-value pairs, e.g. { "ell_percent": 35, "sped_percent": 15, "free_lunch_percent": 60 }'),
      teaching_philosophy: z.string().optional().describe('Your teaching philosophy or approach'),
      available_tech: z.array(z.string()).optional().describe('Available technology, e.g. ["Chromebooks", "smartboard", "Google Classroom"]'),
      special_programs: z.array(z.string()).optional().describe('Special programs, e.g. ["AP", "SPED inclusion", "dual enrollment"]'),
    },
    async ({ teacher_id, ...fields }) => {
      const supabase = createServiceClient();

      // Build update object from provided fields only
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updates[key] = value;
        }
      }

      const { data, error } = await supabase
        .from('teacher_profiles')
        .upsert({ id: teacher_id, ...updates }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error updating profile: ${error.message}` }], isError: true };
      }

      const p = data as TeacherProfile;
      const updatedFields = Object.keys(fields).filter((k) => (fields as Record<string, unknown>)[k] !== undefined);

      return {
        content: [{
          type: 'text' as const,
          text: `Profile updated for **${p.name ?? 'teacher'}**. Fields set: ${updatedFields.join(', ')}.\n\nYour profile now personalizes all skill outputs to your classroom. Use **get_teacher_profile** to review the full profile.`,
        }],
      };
    }
  );
}
