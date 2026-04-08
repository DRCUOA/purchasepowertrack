-- 001_initial_schema.sql
-- Core schema for the NZ Basket Tracker

-- basket_items: the canonical list of tracked grocery items
CREATE TABLE basket_items (
  id SERIAL PRIMARY KEY,
  item_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  unit_label VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  spec JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- basket_item_quantities: how many units a household buys per month
CREATE TABLE basket_item_quantities (
  id SERIAL PRIMARY KEY,
  basket_item_id INTEGER NOT NULL REFERENCES basket_items(id),
  effective_month VARCHAR(7) NOT NULL,
  monthly_quantity NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(basket_item_id, effective_month)
);

-- price_observations: raw scraped prices from retailer sites
CREATE TABLE price_observations (
  id SERIAL PRIMARY KEY,
  basket_item_id INTEGER NOT NULL REFERENCES basket_items(id),
  observed_at TIMESTAMPTZ NOT NULL,
  shop_name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  source_url TEXT,
  raw_title TEXT NOT NULL,
  raw_price NUMERIC(10,2) NOT NULL,
  unit_text VARCHAR(100),
  is_member_price BOOLEAN NOT NULL DEFAULT false,
  is_special BOOLEAN NOT NULL DEFAULT false,
  extraction_method VARCHAR(50) NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}',
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'accepted', 'rejected')),
  review_reason TEXT,
  review_payload JSONB,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- normalized_prices: weekly canonical price per item after LLM review
CREATE TABLE normalized_prices (
  id SERIAL PRIMARY KEY,
  basket_item_id INTEGER NOT NULL REFERENCES basket_items(id),
  week_start DATE NOT NULL,
  canonical_unit_price NUMERIC(10,2) NOT NULL,
  observation_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  method VARCHAR(50) NOT NULL DEFAULT 'median',
  source_detail JSONB NOT NULL DEFAULT '{}',
  llm_review_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(basket_item_id, week_start)
);

-- monthly_snapshots: per-item line totals for a calendar month
CREATE TABLE monthly_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_month VARCHAR(7) NOT NULL,
  basket_item_id INTEGER NOT NULL REFERENCES basket_items(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  normalized_price_id INTEGER REFERENCES normalized_prices(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(snapshot_month, basket_item_id)
);

-- Indexes for query performance
CREATE INDEX idx_price_observations_item_date ON price_observations(basket_item_id, observed_at);
CREATE INDEX idx_price_observations_status ON price_observations(review_status);
CREATE INDEX idx_normalized_prices_item_week ON normalized_prices(basket_item_id, week_start);
CREATE INDEX idx_monthly_snapshots_month ON monthly_snapshots(snapshot_month);
