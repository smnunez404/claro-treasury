-- 1. Explicitly block SELECT on claro_sync_log (internal infrastructure data)
CREATE POLICY sync_log_no_select ON public.claro_sync_log
  FOR SELECT
  USING (false);

-- 2. Fix update_updated_at function search_path (addresses SUPA_function_search_path_mutable)
CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Create a public-safe view for claro_organizations that excludes contact_email
CREATE OR REPLACE VIEW public.v_public_organizations AS
SELECT
  contract_address,
  name,
  country,
  description,
  org_type,
  website,
  logo_url,
  cover_image_url,
  social_instagram,
  social_twitter,
  verified,
  verified_at,
  is_active,
  owner_address,
  factory_address,
  created_at,
  updated_at
FROM public.claro_organizations
WHERE is_active = true;