import { createServiceClient } from './supabase.js';
import { skillRegistry } from '../skills/index.js';
import type {
  TeacherProfile,
  Project,
  Standard,
  ProjectAsset,
  ContextFile,
  AssembledContext,
} from '../types/index.js';

interface AssembleOptions {
  skillId: string;
  teacherId: string;
  projectId?: string;
  additionalInstructions?: string;
}

export async function assembleSkillPrompt(options: AssembleOptions): Promise<AssembledContext> {
  const { skillId, teacherId, projectId, additionalInstructions } = options;

  const skill = skillRegistry[skillId];
  if (!skill) {
    throw new Error(`Skill "${skillId}" not found in registry.`);
  }

  const supabase = createServiceClient();

  // Fetch teacher profile
  const { data: profileData, error: profileError } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', teacherId)
    .maybeSingle();

  if (profileError) throw new Error(`Failed to fetch teacher profile: ${profileError.message}`);

  const profile = profileData as TeacherProfile | null;

  // Fetch project, standards, assets if projectId provided
  let project: Project | null = null;
  let standards: Standard[] = [];
  let assets: ProjectAsset[] = [];

  if (projectId) {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw new Error(`Failed to fetch project: ${projectError.message}`);
    project = projectData as Project;

    // Fetch linked standards and existing assets in parallel
    const [standardsRes, assetsRes] = await Promise.all([
      project.standard_ids.length > 0
        ? supabase.from('standards').select('*').in('id', project.standard_ids)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('project_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
    ]);

    standards = (standardsRes.data ?? []) as Standard[];
    assets = (assetsRes.data ?? []) as ProjectAsset[];
  }

  // Fetch context files (global + project-scoped)
  let contextQuery = supabase
    .from('context_files')
    .select('*')
    .eq('teacher_id', teacherId);

  if (projectId) {
    contextQuery = contextQuery.or(`project_id.eq.${projectId},project_id.is.null`);
  } else {
    contextQuery = contextQuery.is('project_id', null);
  }

  const { data: contextData } = await contextQuery;
  const contextFiles = (contextData ?? []) as ContextFile[];

  // Format sections
  const teacherContext = formatTeacherContext(profile);
  const projectContext = formatProjectContext(project, standards, assets);
  const contextFilesText = formatContextFiles(contextFiles);

  // Replace placeholders in prompt template
  let prompt = skill.promptTemplate;
  prompt = prompt.replace('{{teacherContext}}', teacherContext);
  prompt = prompt.replace('{{projectContext}}', projectContext);
  prompt = prompt.replace('{{contextFiles}}', contextFilesText);

  if (additionalInstructions) {
    prompt = prompt.replace(
      '{{additionalInstructions}}',
      `## Additional Instructions\n${additionalInstructions}`
    );
  } else {
    prompt = prompt.replace('{{additionalInstructions}}', '');
  }

  return {
    skillId: skill.id,
    skillTitle: skill.title,
    prompt,
    metadata: {
      teacherId,
      projectId,
      standardCodes: standards.map((s) => s.standard_code),
      contextFileCount: contextFiles.length,
    },
  };
}

function formatTeacherContext(profile: TeacherProfile | null): string {
  if (!profile) {
    return '_No teacher profile set up yet. Set up your profile with **update_teacher_profile** for personalized outputs._';
  }

  const lines = [
    `- **Name:** ${profile.name ?? 'Not set'}`,
    `- **Grade Levels:** ${profile.grade_levels.join(', ') || 'Not set'}`,
    `- **Subjects:** ${profile.subjects.join(', ') || 'Not set'}`,
    `- **School:** ${profile.school_name ?? 'Not set'} (${profile.school_type ?? 'type not set'})`,
    `- **District:** ${profile.district ?? 'Not set'}`,
    `- **State:** ${profile.state}`,
  ];

  if (profile.student_demographics) {
    const demo = profile.student_demographics;
    const demoLines = Object.entries(demo).map(([k, v]) => `  - ${k}: ${v}`);
    lines.push(`- **Student Demographics:**`);
    lines.push(...demoLines);
  }

  if (profile.teaching_philosophy) {
    lines.push(`- **Teaching Philosophy:** ${profile.teaching_philosophy}`);
  }

  if (profile.available_tech.length > 0) {
    lines.push(`- **Available Technology:** ${profile.available_tech.join(', ')}`);
  }

  if (profile.special_programs.length > 0) {
    lines.push(`- **Special Programs:** ${profile.special_programs.join(', ')}`);
  }

  return lines.join('\n');
}

function formatProjectContext(
  project: Project | null,
  standards: Standard[],
  assets: ProjectAsset[]
): string {
  if (!project) {
    return '_No project selected. Run a skill against a project for standards-aligned output._';
  }

  const lines = [
    `- **Unit:** ${project.title}`,
    `- **Subject:** ${project.subject ?? 'Not set'}`,
    `- **Grade Level:** ${project.grade_level ?? 'Not set'}`,
    `- **Unit Topic:** ${project.unit_topic ?? 'Not set'}`,
  ];

  if (standards.length > 0) {
    lines.push('', '**Linked Standards:**');
    standards.forEach((s) => {
      lines.push(`- **${s.standard_code}**: ${s.description}${s.strand ? ` _(${s.strand})_` : ''}`);
    });
  }

  if (assets.length > 0) {
    lines.push('', '**Existing Assets in This Project:**');
    assets.forEach((a) => {
      lines.push(`- ${a.title} (${a.asset_type})`);
    });
  }

  return lines.join('\n');
}

function formatContextFiles(contextFiles: ContextFile[]): string {
  if (contextFiles.length === 0) {
    return '_No context files. Save context like pacing guides, classroom norms, or reading levels with **save_context_file** for richer outputs._';
  }

  return contextFiles
    .map((f) => `### ${f.title} (${f.category})\n${f.content}`)
    .join('\n\n');
}
