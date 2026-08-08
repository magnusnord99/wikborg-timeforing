-- Restrict feedback reads to the submitting user.
-- Team/admin review should use trusted server-side access, not the public client policy.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
