-- Fix v_public_organizations to use SECURITY INVOKER (respects RLS of querying user)
ALTER VIEW public.v_public_organizations SET (security_invoker = on);

-- Fix existing views to use SECURITY INVOKER as well
ALTER VIEW public.v_org_transparency SET (security_invoker = on);
ALTER VIEW public.v_transparency_score SET (security_invoker = on);