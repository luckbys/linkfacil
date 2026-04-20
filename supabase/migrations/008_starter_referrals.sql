-- Migration 008: Add starter plan and referral system

-- 1. Update plan CHECK constraint to include 'starter'
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro'));

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted')),
  reward_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- Index for fast lookup of referrals by referrer
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals(referrer_id);

-- Index for looking up a referred user's referral record
CREATE INDEX IF NOT EXISTS referrals_referred_id_idx ON referrals(referred_id);

-- 3. Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- System can insert referrals (via service role or edge functions)
CREATE POLICY "Service can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (TRUE);

-- 4. Add referral_code column to profiles (defaults to slug)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;
