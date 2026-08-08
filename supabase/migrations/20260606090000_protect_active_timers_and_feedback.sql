-- Prevent duplicate running timers even when clients are stale or API calls race.
CREATE OR REPLACE FUNCTION prevent_duplicate_active_time_entries()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.user_id::text));

    IF EXISTS (
      SELECT 1
      FROM time_entries
      WHERE user_id = NEW.user_id
        AND end_time IS NULL
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'A user can only have one active timer'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_duplicate_active_time_entries ON time_entries;
CREATE TRIGGER prevent_duplicate_active_time_entries
  BEFORE INSERT OR UPDATE OF user_id, end_time ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_time_entries();

-- Do not allow ON DELETE CASCADE to remove an in-progress time entry.
CREATE OR REPLACE FUNCTION prevent_active_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM time_entries
    WHERE project_id = OLD.id
      AND end_time IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot delete a project with an active timer'
      USING ERRCODE = '23503';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_active_project_delete ON projects;
CREATE TRIGGER prevent_active_project_delete
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_active_project_delete();

-- Feedback can include sensitive client/work details; do not expose it to all users.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
