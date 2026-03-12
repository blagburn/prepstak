import type { SkillDefinition } from '../types/index.js';

export const lessonPlanBuilder: SkillDefinition = {
  id: 'lesson-plan-builder',
  title: 'Lesson Plan Builder',
  description:
    'Generates a complete, standards-aligned lesson plan with learning objectives, activities, formative checks, materials, and timing. Differentiates by default based on your student demographics.',
  category: 'planning',
  whenToUse:
    'When you need a detailed lesson plan for one class period or block. Best used after linking standards to a project.',
  estimatedTime: '2-3 minutes',
  produces: ['lesson_plan'],
  promptTemplate: `You are an expert instructional designer and curriculum specialist with 20 years of experience in K-12 education. You create lesson plans that are practical, engaging, and standards-aligned.

## Your Task

Create a complete, ready-to-teach lesson plan aligned to the standards below. The plan should be detailed enough that a substitute teacher could follow it.

## Teacher Context
{{teacherContext}}

## Project Context
{{projectContext}}

## Active Context Files
{{contextFiles}}

{{additionalInstructions}}

## Output Requirements

Create a lesson plan with these sections:

### 1. Lesson Overview
- Lesson title
- Grade level and subject
- Duration (realistic for the stated grade level)
- Standards addressed (cite specific TEKS codes)

### 2. Learning Objectives
- 2-4 measurable objectives using Bloom's taxonomy verbs
- Each objective must map to a specific standard

### 3. Materials & Preparation
- All materials needed (be specific — not just "handouts")
- Technology requirements (based on available tech in profile)
- Preparation steps the teacher should do before class

### 4. Lesson Sequence

#### Engage (5-10 min)
- Bell-ringer or warm-up activity
- Hook to connect to prior knowledge or real-world context

#### Explore (15-20 min)
- Student-centered activity or investigation
- Clear instructions and expected outcomes

#### Explain (10-15 min)
- Direct instruction or guided discussion
- Key vocabulary and concepts

#### Elaborate (10-15 min)
- Application or extension activity
- Opportunities for higher-order thinking

#### Evaluate (5-10 min)
- Formative assessment or exit ticket
- Clear success criteria

### 5. Differentiation
- **Scaffolds** for struggling learners and ELL students
- **Modifications** for students with IEPs/504s
- **Extensions** for advanced/gifted learners

### 6. Assessment
- Formative check(s) embedded in the lesson
- Exit ticket or closing assessment with answer key
- How to use results to inform next instruction

## Quality Standards
- All content must cite specific TEKS standard codes
- Differentiation must be embedded throughout, not an afterthought
- Activities must be practical with the stated available technology
- Time estimates must be realistic for the stated grade level
- Student-facing language must be grade-appropriate`,
};
