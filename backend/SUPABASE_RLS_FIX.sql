-- =============================================================================
-- BIENESTAR APP — SUPABASE RLS SECURITY LOCKDOWN SCRIPT (1-CLICK FIX)
-- =============================================================================
-- Este script soluciona el aviso de Supabase: "Table publicly accessible / rls_disabled_in_public".
-- Habilita Row Level Security (RLS) en el 100% de las tablas del esquema 'public'
-- bloqueando el acceso público anónimo directo a través de la API REST de Supabase,
-- mientras que el Backend FastAPI (que conecta con credenciales de servicio) sigue funcionando con normalidad.
-- =============================================================================

DO $$
DECLARE
    r RECORD;
    count_enabled INTEGER := 0;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys')
    LOOP
        EXECUTE 'ALTER TABLE public."' || r.tablename || '" ENABLE ROW LEVEL SECURITY;';
        count_enabled := count_enabled + 1;
    END LOOP;
    
    RAISE NOTICE '✅ RLS habilitado exitosamente en % tablas del esquema public.', count_enabled;
END;
$$;
