-- Prevent more than one running timer per user, even across tabs/devices.
CREATE OR REPLACE FUNCTION prevent_duplicate_active_time_entries()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext('time_entries_active'), hashtext(NEW.user_id::text));

    IF EXISTS (
      SELECT 1
      FROM time_entries
      WHERE user_id = NEW.user_id
        AND end_time IS NULL
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'Only one active timer is allowed per user'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_duplicate_active_time_entries ON time_entries;

CREATE TRIGGER prevent_duplicate_active_time_entries
  BEFORE INSERT OR UPDATE OF user_id, end_time
  ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_time_entries();
