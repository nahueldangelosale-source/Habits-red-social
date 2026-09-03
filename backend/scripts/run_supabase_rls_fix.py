import asyncio
import asyncpg
import os

# Supabase connection parameters
DATABASE_URL = "postgresql://postgres.auwayrniyaoiabkpdkav:Eloso2026*-@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

SQL_SCRIPT = """
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
    
    RAISE NOTICE 'RLS habilitado exitosamente en % tablas del esquema public.', count_enabled;
END;
$$;
"""

async def main():
    print("Conectando a Supabase PostgreSQL...")
    try:
        conn = await asyncpg.connect(DATABASE_URL, timeout=30)
        print("Conectado exitosamente. Ejecutando script de seguridad RLS...")
        
        await conn.execute(SQL_SCRIPT)
        print("[EXITO] Row Level Security (RLS) habilitado en TODAS las tablas de Supabase.")
        
        # Verify tables with RLS status
        rows = await conn.fetch("""
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        
        print("\n--- Estado de RLS por tabla en Supabase ---")
        for row in rows:
            status = "HABILITADO (Seguro)" if row['rowsecurity'] else "DESHABILITADO"
            print(f"- {row['tablename']}: {status}")
            
        await conn.close()
    except Exception as e:
        print(f"[ERROR] No se pudo ejecutar el script: {e}")

if __name__ == "__main__":
    asyncio.run(main())
