-- Legg til status for tilbakemeldinger, og la alle innloggede håndtere all feedback (teamgjennomgang)
ALTER TABLE feedback ADD COLUMN resolved BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_feedback_resolved ON feedback(resolved);

-- Bytt ut "slett egen" med "slett alle" - alle innloggede kan allerede se alt
DROP POLICY "Users can delete own feedback" ON feedback;

CREATE POLICY "Authenticated users can delete feedback"
  ON feedback FOR DELETE
  USING (auth.role() = 'authenticated');

-- Alle innloggede kan markere feedback som løst/ikke løst
CREATE POLICY "Authenticated users can update feedback"
  ON feedback FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
