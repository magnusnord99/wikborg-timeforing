-- Feedback can include sensitive bug-report details. Keep reads scoped to the
-- submitting user instead of exposing every row to all authenticated users.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
