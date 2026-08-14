-- Ensure a time entry can only point at one of the same user's projects.
DROP POLICY IF EXISTS "Users can insert own time entries" ON time_entries;
CREATE POLICY "Users can insert own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = time_entries.project_id
        AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = time_entries.project_id
        AND projects.user_id = auth.uid()
    )
  );
