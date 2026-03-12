// === Database Row Types ===

export interface Standard {
  id: string;
  state: string;
  framework: string;
  subject: string;
  course: string | null;
  grade_level: string;
  strand: string | null;
  standard_code: string;
  description: string;
  keywords: string[];
  created_at: string;
}

export interface TeacherProfile {
  id: string;
  name: string | null;
  grade_levels: string[];
  subjects: string[];
  school_type: string | null;
  school_name: string | null;
  district: string | null;
  state: string;
  student_demographics: Record<string, unknown> | null;
  teaching_philosophy: string | null;
  available_tech: string[];
  special_programs: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  teacher_id: string;
  title: string;
  standard_ids: string[];
  subject: string | null;
  grade_level: string | null;
  unit_topic: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  skill_id: string | null;
  asset_type: AssetType;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  when_to_use: string | null;
  estimated_time: string | null;
  prompt_template: string;
  produces: AssetType[];
  source: 'library' | 'custom';
  created_at: string;
}

export interface ContextFile {
  id: string;
  teacher_id: string;
  project_id: string | null;
  title: string;
  category: ContextFileCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

// === Union Types ===

export type SkillCategory =
  | 'planning'
  | 'assessment'
  | 'differentiation'
  | 'communication'
  | 'content';

export type AssetType =
  | 'lesson_plan'
  | 'unit_plan'
  | 'assessment'
  | 'rubric'
  | 'accommodations'
  | 'parent_email';

export type ContextFileCategory =
  | 'pacing'
  | 'norms'
  | 'textbook'
  | 'reading_levels'
  | 'grading'
  | 'general';

// === Skill Definition (code-defined skills with prompt templates) ===

export interface SkillDefinition {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  whenToUse: string;
  estimatedTime: string;
  produces: AssetType[];
  promptTemplate: string;
}

// === Context Builder Output ===

export interface AssembledContext {
  skillId: string;
  skillTitle: string;
  prompt: string;
  metadata: {
    teacherId: string;
    projectId?: string;
    standardCodes: string[];
    contextFileCount: number;
  };
}

// === Tool Input Types ===

export interface BrowseStandardsInput {
  subject?: string;
  grade_level?: string;
  course?: string;
  strand?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface GetTeacherProfileInput {
  teacher_id: string;
}

export interface UpdateTeacherProfileInput {
  teacher_id: string;
  name?: string;
  grade_levels?: string[];
  subjects?: string[];
  school_type?: string;
  school_name?: string;
  district?: string;
  state?: string;
  student_demographics?: Record<string, unknown>;
  teaching_philosophy?: string;
  available_tech?: string[];
  special_programs?: string[];
}

export interface CreateProjectInput {
  teacher_id: string;
  title: string;
  standard_ids?: string[];
  subject?: string;
  grade_level?: string;
  unit_topic?: string;
}

export interface ListProjectsInput {
  teacher_id: string;
  status?: 'active' | 'archived';
}

export interface GetProjectContextInput {
  project_id: string;
  teacher_id: string;
}

export interface ListSkillsInput {
  category?: SkillCategory;
}

export interface RunSkillInput {
  skill_id: string;
  teacher_id: string;
  project_id?: string;
  additional_instructions?: string;
}

export interface SaveContextFileInput {
  teacher_id: string;
  project_id?: string;
  title: string;
  category: ContextFileCategory;
  content: string;
}

export interface ListContextFilesInput {
  teacher_id: string;
  project_id?: string;
  category?: ContextFileCategory;
}
