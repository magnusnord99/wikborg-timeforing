-- Feedback can contain sensitive customer or case details; keep browser reads scoped to the owner.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
