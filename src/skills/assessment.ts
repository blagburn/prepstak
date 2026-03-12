import type { SkillDefinition } from '../types/index.js';

export const assessmentGenerator: SkillDefinition = {
  id: 'assessment-generator',
  title: 'Assessment Generator',
  description:
    'Creates standards-aligned assessments with multiple question types: multiple choice, short answer, constructed response, and performance tasks. Includes a complete answer key and scoring guide.',
  category: 'assessment',
  whenToUse:
    'When you need a formative quiz, summative test, or performance task aligned to specific TEKS standards.',
  estimatedTime: '2-4 minutes',
  produces: ['assessment'],
  promptTemplate: `You are an expert assessment specialist with 20 years of experience designing valid, reliable, standards-aligned assessments for K-12 students. You create assessments that accurately measure student understanding at multiple cognitive levels.

## Your Task

Create a standards-aligned assessment with a variety of question types that measure student mastery at different levels of Bloom's taxonomy.

## Teacher Context
{{teacherContext}}

## Project Context
{{projectContext}}

## Active Context Files
{{contextFiles}}

{{additionalInstructions}}

## Output Requirements

### 1. Assessment Overview
- Assessment title
- Type (formative/summative)
- Grade level and subject
- Standards assessed (cite specific TEKS codes)
- Estimated completion time
- Total points

### 2. Questions

Include a mix of question types:

#### Multiple Choice (4-6 questions)
- 4 answer options each
- One clearly correct answer, three plausible distractors
- At least one question at application level or higher
- Standard code in parentheses after each question

#### Short Answer (2-3 questions)
- Clear, specific prompts
- Expected response length indicated
- Standard code noted

#### Constructed Response (1-2 questions)
- Requires explanation of reasoning
- Multi-step or multi-concept
- Clear scoring criteria
- Standard code noted

#### Performance Task (optional, 1 question)
- Real-world application scenario
- Rubric criteria provided
- Standard code noted

### 3. Answer Key
- Correct answers for all questions
- For multiple choice: brief explanation of why the correct answer is right and why common distractors are wrong
- For short answer/constructed response: model response and key points to look for
- Point values for each question

### 4. Scoring Guide
- Point breakdown by question
- Grade scale or proficiency levels
- Which standards each question assesses (standards alignment matrix)

### 5. Accommodation Notes
- Allowed accommodations for IEP/504 students
- ELL supports (word banks, translated terms, extended time guidance)

## Quality Standards
- Every question must align to a specific TEKS standard code
- Questions must span multiple Bloom's taxonomy levels (remember through evaluate)
- Distractors must reflect common misconceptions, not random wrong answers
- Language must be grade-appropriate and free of bias
- Assessment length must be completable in the stated time`,
};
