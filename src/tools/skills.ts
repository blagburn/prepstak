import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { skillRegistry } from '../skills/index.js';
import { assembleSkillPrompt } from '../lib/context-builder.js';
import type { SkillCategory } from '../types/index.js';

export function registerSkillTools(server: McpServer): void {
  server.tool(
    'list_skills',
    'List all available PrepStak skills grouped by category. Each skill is an expert AI workflow that produces standards-aligned content personalized to your classroom.',
    {
      category: z.enum(['planning', 'assessment', 'differentiation', 'communication', 'content']).optional().describe('Filter by skill category'),
    },
    async ({ category }) => {
      const skills = Object.values(skillRegistry);
      const filtered = category ? skills.filter((s) => s.category === category) : skills;

      if (filtered.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `No skills found${category ? ` in category "${category}"` : ''}.` }],
        };
      }

      // Group by category
      const grouped = new Map<SkillCategory, typeof filtered>();
      for (const skill of filtered) {
        const group = grouped.get(skill.category) ?? [];
        group.push(skill);
        grouped.set(skill.category, group);
      }

      const sections: string[] = ['## Available Skills\n'];

      for (const [cat, catSkills] of grouped) {
        sections.push(`### ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n`);
        for (const s of catSkills) {
          sections.push(
            `**${s.title}** (\`${s.id}\`)\n${s.description}\n- _When to use:_ ${s.whenToUse}\n- _Estimated time:_ ${s.estimatedTime}\n- _Produces:_ ${s.produces.join(', ')}\n`
          );
        }
      }

      return { content: [{ type: 'text' as const, text: sections.join('\n') }] };
    }
  );

  server.tool(
    'run_skill',
    'Run an expert AI skill on a project. Assembles your teacher profile, linked standards, and context files into a personalized prompt. The AI then executes the skill to generate standards-aligned content.',
    {
      skill_id: z.string().describe('Skill ID from list_skills, e.g. "lesson-plan-builder"'),
      teacher_id: z.string().uuid().describe('The teacher\'s unique ID'),
      project_id: z.string().uuid().optional().describe('Project to run the skill against (recommended — includes linked standards)'),
      additional_instructions: z.string().optional().describe('Extra instructions for this run, e.g. "Focus on lab activities" or "Make it a 45-minute lesson"'),
    },
    async ({ skill_id, teacher_id, project_id, additional_instructions }) => {
      const skill = skillRegistry[skill_id];
      if (!skill) {
        const available = Object.keys(skillRegistry).join(', ');
        return {
          content: [{
            type: 'text' as const,
            text: `Skill "${skill_id}" not found. Available skills: ${available}`,
          }],
          isError: true,
        };
      }

      try {
        const assembled = await assembleSkillPrompt({
          skillId: skill_id,
          teacherId: teacher_id,
          projectId: project_id,
          additionalInstructions: additional_instructions,
        });

        return {
          content: [{
            type: 'text' as const,
            text: assembled.prompt,
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text' as const, text: `Error running skill: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
