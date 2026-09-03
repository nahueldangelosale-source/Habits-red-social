from app.infrastructure.dtg.storage import init_dtg_schema
from app.infrastructure.dtg.engine import DTGEngine
import os
import asyncio

def run_init():
    print("[INIT] Creating DTG tables in SQLite (dtg.db)...")
    init_dtg_schema()
    print("[INIT] DTG Tables created successfully.")

    print("[SCAN] Starting AST scan of 'app/domains/squads'...")
    engine_dtg = DTGEngine()
    squads_path = os.path.join("app", "domains", "squads")
    engine_dtg.scan_directory(squads_path)
    print("[SCAN] AST Scan completed. DTG populated.")

if __name__ == "__main__":
    run_init()
