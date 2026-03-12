import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createServiceClient } from '../lib/supabase.js';
import type { Standard } from '../types/index.js';

export function registerStandardsTools(server: McpServer): void {
  server.tool(
    'browse_standards',
    'Search and filter Texas TEKS learning standards by subject, grade, course, strand, or keywords. Returns matching standards with codes and descriptions.',
    {
      subject: z.string().optional().describe('Filter by subject: "Science" or "Mathematics"'),
      grade_level: z.string().optional().describe('Filter by grade level: "6", "7", "8", "9-12"'),
      course: z.string().optional().describe('Filter by course: "Biology", "Algebra I", etc.'),
      strand: z.string().optional().describe('Filter by strand: "Force and Motion", "Algebraic Reasoning"'),
      query: z.string().optional().describe('Keyword search across standard descriptions'),
      limit: z.number().optional().default(25).describe('Max results (default 25)'),
      offset: z.number().optional().default(0).describe('Offset for pagination'),
    },
    async ({ subject, grade_level, course, strand, query, limit, offset }) => {
      const supabase = createServiceClient();

      let q = supabase
        .from('standards')
        .select('*', { count: 'exact' });

      if (subject) q = q.ilike('subject', subject);
      if (grade_level) q = q.eq('grade_level', grade_level);
      if (course) q = q.ilike('course', `%${course}%`);
      if (strand) q = q.ilike('strand', `%${strand}%`);
      if (query) q = q.or(`description.ilike.%${query}%,standard_code.ilike.%${query}%`);

      q = q.order('standard_code', { ascending: true });
      q = q.range(offset, offset + limit - 1);

      const { data, error, count } = await q;

      if (error) {
        return { content: [{ type: 'text' as const, text: `Error searching standards: ${error.message}` }], isError: true };
      }

      const standards = (data ?? []) as Standard[];

      if (standards.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: 'No standards found matching your filters. Try broadening your search — for example, just filter by subject or grade level.',
          }],
        };
      }

      const lines = standards.map(
        (s) => `**${s.standard_code}** (${s.course ?? s.subject}, Grade ${s.grade_level})\n${s.description}${s.strand ? `\n_Strand: ${s.strand}_` : ''}`
      );

      const header = `Found ${count ?? standards.length} standards (showing ${offset + 1}–${offset + standards.length}):`;

      return {
        content: [{ type: 'text' as const, text: `${header}\n\n${lines.join('\n\n')}` }],
      };
    }
  );
}
