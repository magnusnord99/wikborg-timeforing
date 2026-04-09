-- Tilbakemeldinger fra brukere
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Brukere kan sende inn egen feedback
CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Alle innloggede brukere kan se all feedback (for teamgjennomgang)
CREATE POLICY "Authenticated users can view all feedback"
  ON feedback FOR SELECT
  USING (auth.role() = 'authenticated');

-- Brukere kan slette sin egen feedback
CREATE POLICY "Users can delete own feedback"
  ON feedback FOR DELETE
  USING (auth.uid() = user_id);
