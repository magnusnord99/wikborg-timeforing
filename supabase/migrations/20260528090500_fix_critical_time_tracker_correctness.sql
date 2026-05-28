-- Prevent users from creating more than one active timer, including concurrent requests.
CREATE OR REPLACE FUNCTION prevent_duplicate_active_time_entries()
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
      RAISE EXCEPTION 'A user can only have one active time entry'
        USING ERRCODE = '23505';
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

-- Feedback submissions can contain private customer or case details.
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON feedback;
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
