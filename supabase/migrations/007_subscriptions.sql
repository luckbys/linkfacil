-- Migration: Subscriptions & Plan Management
-- Adds subscription tracking for Free/Pro plans with Stripe integration

-- Add plan fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Subscription history table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'checkout_started', 'payment_success', 'payment_failed', 'canceled', 'renewed'
  stripe_event_id TEXT,
  plan TEXT,
  amount INTEGER, -- in cents (BRL)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Plan limits reference (enforced in frontend)
COMMENT ON COLUMN profiles.plan IS 'User plan: free (5 links, basic themes) or pro (unlimited links, all features)';
