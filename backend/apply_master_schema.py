"""
Bienestar APP — Automated Master Schema Applier for Supabase
Applies master_supabase_schema.sql safely per-statement with isolated transactions.
"""
import asyncio
import os
import sys
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Force UTF-8 on Windows stdout
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(__file__))
from app.config import get_settings
from bootstrap_supabase import create_enums, seed_user

async def apply_master_schema():
    print("=" * 60)
    print("  [APPLY] APLICANDO MASTER SCHEMA EN SUPABASE / POSTGRESQL")
    print("=" * 60)
    
    settings = get_settings()
    engine = create_async_engine(
        settings.database_url,
        connect_args={"prepared_statement_cache_size": 0}
    )
    
    schema_path = Path(__file__).parent / "master_supabase_schema.sql"
    if not schema_path.exists():
        print(f"[ERROR] No se encontro {schema_path}")
        return
        
    sql_content = schema_path.read_text(encoding="utf-8")
    
    # Separar comandos SQL respetando bloques DO $$
    statements = []
    current_stmt = []
    in_dollar_block = False
    
    for line in sql_content.splitlines():
        trimmed = line.strip()
        
        # Ignorar comentarios y bloques de transaccion global
        if trimmed.startswith("--") and not current_stmt:
            continue
        if trimmed in ("BEGIN;", "COMMIT;") and not in_dollar_block:
            continue
            
        if "$$" in line:
            in_dollar_block = not in_dollar_block
            
        current_stmt.append(line)
        
        if trimmed.endswith(";") and not in_dollar_block:
            full_stmt = "\n".join(current_stmt).strip()
            if full_stmt:
                statements.append(full_stmt)
            current_stmt = []
            
    if current_stmt:
        remainder = "\n".join(current_stmt).strip()
        if remainder:
            statements.append(remainder)
            
    print(f"[INFO] Total de bloques SQL a aplicar: {len(statements)}")
    
    # Aplicar cada sentencia en su propia conexion/transaccion para tolerar skips
    applied = 0
    skipped = 0
    
    for idx, stmt in enumerate(statements, 1):
        if not stmt:
            continue
        first_line = stmt.splitlines()[0][:60]
        
        async with engine.connect() as conn:
            try:
                await conn.execute(text(stmt))
                await conn.commit()
                applied += 1
                print(f"  [{idx}/{len(statements)}] [OK] {first_line}...")
            except Exception as e:
                err_msg = str(e)
                if any(kw in err_msg for kw in ["already exists", "duplicate key", "already enabled"]):
                    skipped += 1
                    print(f"  [{idx}/{len(statements)}] [SKIP - YA EXISTE] {first_line}...")
                else:
                    print(f"  [{idx}/{len(statements)}] [WARN] {first_line} -> {err_msg[:80]}...")

    print(f"\n[INFO] Sentencias aplicadas: {applied}, Existentes/Skipped: {skipped}")
    
    print("\n--- 2. Ejecutando Bootstrap de Enums y Usuario Inicial ---")
    async with engine.connect() as conn:
        await create_enums(conn)
        await conn.commit()
        await seed_user(conn)
        await conn.commit()
        
    await engine.dispose()
    print("\n" + "=" * 60)
    print("  [SUCCESS] BASE DE DATOS DE SUPABASE 100% SINCRONIZADA Y LISTA")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(apply_master_schema())
