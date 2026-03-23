-- ═══════════════════════════════════════════════════════════
-- AVAP Quiz — Script SQL pour Supabase
-- Exécuter dans : SQL Editor de ton dashboard Supabase
-- ═══════════════════════════════════════════════════════════

-- 1. Table "game_sessions" — état global du quiz
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY DEFAULT 'main',
  phase TEXT NOT NULL DEFAULT 'lobby',           -- lobby | question | reveal | finished
  current_question INTEGER NOT NULL DEFAULT -1,
  time_left INTEGER NOT NULL DEFAULT 30,
  question_start_time BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insérer la session par défaut
INSERT INTO game_sessions (id, phase, current_question, time_left)
VALUES ('main', 'lobby', -1, 30)
ON CONFLICT (id) DO NOTHING;

-- 2. Table "players" — joueurs connectés
CREATE TABLE IF NOT EXISTS players (
  session_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  answered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table "answers" — réponses du round en cours
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  player_session_id TEXT NOT NULL REFERENCES players(session_id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_session_id, question_index)
);

-- 4. Table "quiz_events" — canal d'événements temps réel
--    Les clients écoutent les INSERT sur cette table via Supabase Realtime
CREATE TABLE IF NOT EXISTS quiz_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,    -- question | timer | reveal | progress | gameover | reset | playercount
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- ACTIVER REALTIME sur la table quiz_events
-- ═══════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_events;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- On désactive RLS pour simplifier (le quiz est public)
-- En production, tu peux affiner avec des policies
-- ═══════════════════════════════════════════════════════════
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_events ENABLE ROW LEVEL SECURITY;

-- Policies : accès public pour toutes les opérations
CREATE POLICY "Public access" ON game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON quiz_events FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- FONCTION : nettoyer les anciens événements (garder 1h)
-- Optionnel mais recommandé pour ne pas surcharger la table
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION clean_old_events()
RETURNS void AS $$
BEGIN
  DELETE FROM quiz_events WHERE created_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Tu peux appeler manuellement ou créer un cron avec pg_cron si activé :
-- SELECT cron.schedule('clean-quiz-events', '*/30 * * * *', 'SELECT clean_old_events()');
