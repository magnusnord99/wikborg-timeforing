-- Prevent overlapping active timers for a user, even across tabs.
CREATE OR REPLACE FUNCTION prevent_multiple_active_timers()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

    IF EXISTS (
      SELECT 1
      FROM time_entries
      WHERE user_id = NEW.user_id
        AND end_time IS NULL
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'User already has an active timer';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_multiple_active_timers ON time_entries;
CREATE TRIGGER prevent_multiple_active_timers
  BEFORE INSERT OR UPDATE OF end_time ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_active_timers();

-- Deleting an active project cascades to its running timer; block that loss.
CREATE OR REPLACE FUNCTION prevent_active_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM time_entries
    WHERE project_id = OLD.id
      AND end_time IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot delete a project with an active timer';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_active_project_delete ON projects;
CREATE TRIGGER prevent_active_project_delete
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_active_project_delete();

-- Feedback may contain sensitive details; users should not read other users' submissions.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
