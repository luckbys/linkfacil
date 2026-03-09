-- Billing and subscription foundation

-- 1) Add plan fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'start'
  CHECK (plan_type IN ('start', 'pro', 'business'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
  CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_provider TEXT;

-- 2) Subscription source-of-truth table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercado_pago', 'pagarme')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('start', 'pro', 'business')),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- service_role webhook processing
DO $$ BEGIN
  CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON public.subscriptions(provider_subscription_id);

-- 3) Webhook event storage for idempotency/auditing
CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercado_pago', 'pagarme')),
  event_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, event_id)
);

ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage webhook events"
    ON public.billing_webhook_events FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4) Keep profile plan/status synced from latest active-like subscription
CREATE OR REPLACE FUNCTION public.sync_profile_plan_from_subscription(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  s RECORD;
BEGIN
  SELECT plan_type, status, provider
  INTO s
  FROM public.subscriptions
  WHERE user_id = p_user_id
  ORDER BY
    CASE status
      WHEN 'active' THEN 1
      WHEN 'trialing' THEN 2
      WHEN 'past_due' THEN 3
      WHEN 'canceled' THEN 4
      ELSE 5
    END,
    updated_at DESC
  LIMIT 1;

  IF s IS NULL THEN
    UPDATE public.profiles
    SET plan_type = 'start', subscription_status = 'inactive', subscription_provider = NULL
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles
    SET plan_type = s.plan_type,
        subscription_status = s.status,
        subscription_provider = s.provider,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trg_sync_profile_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.sync_profile_plan_from_subscription(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_sync_profile_trigger ON public.subscriptions;
CREATE TRIGGER subscriptions_sync_profile_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.trg_sync_profile_plan_from_subscription();

-- 5) Link limit enforcement for free plan (start)
CREATE OR REPLACE FUNCTION public.can_add_link(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  p_plan TEXT;
  p_status TEXT;
  total_links INTEGER;
BEGIN
  SELECT plan_type, subscription_status INTO p_plan, p_status
  FROM public.profiles
  WHERE id = p_user_id;

  -- paid access
  IF p_plan IN ('pro', 'business') AND p_status IN ('active', 'trialing', 'past_due') THEN
    RETURN true;
  END IF;

  -- free/start: up to 8 links
  SELECT COUNT(*) INTO total_links FROM public.links WHERE user_id = p_user_id;
  RETURN total_links < 8;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.enforce_link_limit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.can_add_link(NEW.user_id) THEN
    RAISE EXCEPTION 'Limite do plano Start atingido. Faça upgrade para continuar.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS links_enforce_limit_trigger ON public.links;
CREATE TRIGGER links_enforce_limit_trigger
BEFORE INSERT ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.enforce_link_limit_trigger();
