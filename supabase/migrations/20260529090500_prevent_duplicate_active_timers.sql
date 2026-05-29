-- Prevent duplicate running timers for a user, even if two clients start at once.
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
      RAISE EXCEPTION 'User already has an active timer'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_active_time_entries
  BEFORE INSERT OR UPDATE OF user_id, end_time ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_time_entries();
