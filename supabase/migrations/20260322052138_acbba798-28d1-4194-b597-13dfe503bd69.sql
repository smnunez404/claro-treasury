-- 1. Create a public-safe view for donations that excludes donor_email
CREATE OR REPLACE VIEW public.v_public_donations
WITH (security_invoker = on) AS
SELECT
  id,
  donor_address,
  is_anonymous,
  donated_at,
  created_at,
  tx_hash,
  org_contract,
  onchain_project_id,
  amount_usd,
  message,
  project_id,
  amount_avax
FROM public.claro_donations
WHERE is_anonymous = false;

-- 2. Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS donations_select_public ON public.claro_donations;

-- 3. Replace with a restricted policy that blocks direct anonymous access
-- (donors can still see their own donations via donations_select_own)
CREATE POLICY donations_no_public_select ON public.claro_donations
  FOR SELECT
  USING (false);