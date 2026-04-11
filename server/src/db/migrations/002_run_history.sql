-- 002_run_history.sql
-- Persist every refresh and snapshot run so the History view can show
-- price movement across runs, even multiple runs on the same day.

CREATE TABLE run_history (
  id SERIAL PRIMARY KEY,
  run_type VARCHAR(20) NOT NULL CHECK (run_type IN ('refresh', 'snapshot')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL,
  basket_total NUMERIC(10,2),
  item_count INTEGER NOT NULL DEFAULT 0,
  summary JSONB NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_run_history_type_started ON run_history(run_type, started_at DESC);
CREATE INDEX idx_run_history_started ON run_history(started_at DESC);
