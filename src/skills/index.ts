import type { SkillDefinition } from '../types/index.js';
import { lessonPlanBuilder } from './lesson-plan.js';
import { unitPlanArchitect } from './unit-plan.js';
import { assessmentGenerator } from './assessment.js';
import { rubricCreator } from './rubric.js';
import { accommodationAdapter } from './accommodation.js';
import { parentCommDrafter } from './parent-comm.js';

export const skillRegistry: Record<string, SkillDefinition> = {
  [lessonPlanBuilder.id]: lessonPlanBuilder,
  [unitPlanArchitect.id]: unitPlanArchitect,
  [assessmentGenerator.id]: assessmentGenerator,
  [rubricCreator.id]: rubricCreator,
  [accommodationAdapter.id]: accommodationAdapter,
  [parentCommDrafter.id]: parentCommDrafter,
};
