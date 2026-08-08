-- Feedback can contain private customer/project details; users should only read their own rows.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
