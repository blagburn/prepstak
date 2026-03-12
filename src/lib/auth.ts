/**
 * MVP auth helper — extracts teacher_id from tool parameters.
 * OAuth 2.1 flow deferred to Phase 2. For now, tools accept an
 * explicit teacher_id parameter so we can develop and test without
 * a full auth stack.
 */

export function resolveTeacherId(params: { teacher_id?: string }): string {
  if (!params.teacher_id) {
    throw new Error(
      'teacher_id is required. In the MVP, pass it explicitly. OAuth coming in Phase 2.'
    );
  }
  return params.teacher_id;
}
