-- Prevent data corruption from overlapping active timers and active project deletion.

CREATE INDEX IF NOT EXISTS idx_time_entries_active_by_user
  ON time_entries(user_id)
  WHERE end_time IS NULL;

CREATE OR REPLACE FUNCTION prevent_duplicate_active_time_entries()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL THEN
    PERFORM pg_advisory_xact_lock(('x' || substr(md5(NEW.user_id::text), 1, 16))::bit(64)::bigint);

    IF EXISTS (
      SELECT 1
      FROM time_entries
      WHERE user_id = NEW.user_id
        AND end_time IS NULL
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'A user can only have one active time entry';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_duplicate_active_time_entries_trigger ON time_entries;
CREATE TRIGGER prevent_duplicate_active_time_entries_trigger
  BEFORE INSERT OR UPDATE OF user_id, end_time ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_time_entries();

CREATE OR REPLACE FUNCTION prevent_active_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM time_entries
    WHERE project_id = OLD.id
      AND end_time IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot delete a project with an active time entry';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_active_project_delete_trigger ON projects;
CREATE TRIGGER prevent_active_project_delete_trigger
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_active_project_delete();
