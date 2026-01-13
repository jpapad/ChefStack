-- ChefStack Kitchen Display System - Database Migration
-- Creates kitchen_orders table for POS integration
-- Version: 1.0.0
-- Date: 2025-11-XX

-- ============================================================================
-- Create kitchen_orders table
-- ============================================================================

CREATE TABLE IF NOT EXISTS kitchen_orders (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Team association (multi-tenant)
  team_id TEXT NOT NULL,
  
  -- Order identification
  order_number TEXT NOT NULL,
  table_number TEXT,
  customer_name TEXT,
  
  -- Kitchen workflow
  station TEXT,  -- 'Hot Kitchen', 'Cold Kitchen', 'Bar', 'Pastry', etc.
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'ready', 'served', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Order items (JSONB for flexibility)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Integration metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('pos', 'manual', 'online', 'tablet')),
  external_order_id TEXT,  -- Reference to POS system order ID
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  estimated_time INTEGER,  -- Estimated completion time in minutes
  
  -- Additional info
  notes TEXT
);

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

-- Filter by team (most common query)
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_team_id 
  ON kitchen_orders(team_id);

-- Filter by status (active orders)
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_status 
  ON kitchen_orders(status);

-- Recent orders (dashboard, reporting)
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_created_at 
  ON kitchen_orders(created_at DESC);

-- POS integration lookups
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_external_id 
  ON kitchen_orders(external_order_id) 
  WHERE external_order_id IS NOT NULL;

-- Station-specific views
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_station 
  ON kitchen_orders(station) 
  WHERE station IS NOT NULL;

-- Composite index for active orders by team
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_team_status_created 
  ON kitchen_orders(team_id, status, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE kitchen_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see orders from their team
CREATE POLICY "Users can view their team's orders"
  ON kitchen_orders
  FOR SELECT
  USING (
    team_id IN (
      SELECT (membership->>'teamId')::text
      FROM users u,
      jsonb_array_elements(u.memberships) AS membership
      WHERE u.id = auth.uid()::text
    )
  );

-- Policy: Users can create orders for their team
CREATE POLICY "Users can create orders for their team"
  ON kitchen_orders
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT (membership->>'teamId')::text
      FROM users u,
      jsonb_array_elements(u.memberships) AS membership
      WHERE u.id = auth.uid()::text
    )
  );

-- Policy: Users can update orders in their team
CREATE POLICY "Users can update their team's orders"
  ON kitchen_orders
  FOR UPDATE
  USING (
    team_id IN (
      SELECT (membership->>'teamId')::text
      FROM users u,
      jsonb_array_elements(u.memberships) AS membership
      WHERE u.id = auth.uid()::text
    )
  );

-- Policy: Users can delete orders in their team
CREATE POLICY "Users can delete their team's orders"
  ON kitchen_orders
  FOR DELETE
  USING (
    team_id IN (
      SELECT (membership->>'teamId')::text
      FROM users u,
      jsonb_array_elements(u.memberships) AS membership
      WHERE u.id = auth.uid()::text
    )
  );

-- Policy: Allow service role (webhooks) to insert orders
CREATE POLICY "Service role can insert orders"
  ON kitchen_orders
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Enable Realtime for kitchen_orders
-- ============================================================================

-- This allows real-time subscriptions from the ChefStack app
ALTER PUBLICATION supabase_realtime ADD TABLE kitchen_orders;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Automatically set started_at when status changes to 'in-progress'
CREATE OR REPLACE FUNCTION set_kitchen_order_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in-progress' AND OLD.status != 'in-progress' AND NEW.started_at IS NULL THEN
    NEW.started_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_started_at
  BEFORE UPDATE ON kitchen_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_kitchen_order_started_at();

-- Automatically set ready_at when status changes to 'ready'
CREATE OR REPLACE FUNCTION set_kitchen_order_ready_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ready' AND OLD.status != 'ready' AND NEW.ready_at IS NULL THEN
    NEW.ready_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ready_at
  BEFORE UPDATE ON kitchen_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_kitchen_order_ready_at();

-- Automatically set served_at when status changes to 'served'
CREATE OR REPLACE FUNCTION set_kitchen_order_served_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'served' AND OLD.status != 'served' AND NEW.served_at IS NULL THEN
    NEW.served_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_served_at
  BEFORE UPDATE ON kitchen_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_kitchen_order_served_at();

-- Automatically set cancelled_at when status changes to 'cancelled'
CREATE OR REPLACE FUNCTION set_kitchen_order_cancelled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_cancelled_at
  BEFORE UPDATE ON kitchen_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_kitchen_order_cancelled_at();

-- ============================================================================
-- Sample data (optional - for testing)
-- ============================================================================

-- Uncomment to insert sample orders
/*
INSERT INTO kitchen_orders (team_id, order_number, table_number, station, items, status, priority, source)
VALUES 
  (
    (SELECT id FROM teams LIMIT 1),
    'ORD-001',
    'T5',
    'Hot Kitchen',
    '[
      {"id": "1", "recipeName": "Margherita Pizza", "quantity": 2, "notes": "Extra cheese"},
      {"id": "2", "recipeName": "Caesar Salad", "quantity": 1}
    ]'::jsonb,
    'new',
    'normal',
    'manual'
  ),
  (
    (SELECT id FROM teams LIMIT 1),
    'ORD-002',
    'T3',
    'Bar',
    '[
      {"id": "3", "recipeName": "Espresso", "quantity": 2},
      {"id": "4", "recipeName": "Cappuccino", "quantity": 1, "specialRequests": "Oat milk"}
    ]'::jsonb,
    'in-progress',
    'high',
    'pos'
  );
*/

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'kitchen_orders' 
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'kitchen_orders';

-- Check RLS policies
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'kitchen_orders';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- To run this migration:
-- 1. Save this file as supabase/migrations/YYYYMMDDHHMMSS_create_kitchen_orders.sql
-- 2. Run: supabase db push
-- Or paste into Supabase SQL Editor and execute

COMMENT ON TABLE kitchen_orders IS 'Kitchen Display System orders from POS integration or manual entry';
COMMENT ON COLUMN kitchen_orders.items IS 'JSONB array of order items with recipe info';
COMMENT ON COLUMN kitchen_orders.external_order_id IS 'Original order ID from POS system';
COMMENT ON COLUMN kitchen_orders.source IS 'Where the order came from (pos, manual, online, tablet)';
