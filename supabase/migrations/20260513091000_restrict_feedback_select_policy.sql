-- Restrict feedback reads to the submitting user. Team-wide review should use
-- a privileged server-side path, not the browser-exposed authenticated role.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
