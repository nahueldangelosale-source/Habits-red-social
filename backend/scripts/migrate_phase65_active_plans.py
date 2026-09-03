import asyncio
import hashlib
import time
import json
import uuid
import sys
import os
import argparse

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.db.connection import engine
from app.db.models import ActivePlanStatus

def setup_args():
    parser = argparse.ArgumentParser(description="Migrate Protocols to ActiveWorkoutPlans")
    parser.add_argument("--dry-run", action="store_true", help="Run without mutating the database")
    return parser.parse_args()

async def migrate_data():
    args = setup_args()
    is_dry_run = args.dry_run
    
    print(f"Starting throttled migration of Protocols to ActiveWorkoutPlans... {'(DRY RUN)' if is_dry_run else ''}")
    
    batch_size = 100
    last_processed_id = "00000000-0000-0000-0000-000000000000"
    total_migrated = 0
    total_skipped = 0
    
    # Archivo de auditoría
    audit_file = "migration_audit.log"
    if is_dry_run and os.path.exists(audit_file):
        os.remove(audit_file)
    
    # Optional Kill Switch Check
    if os.getenv("KILL_SWITCH_MIGRATION", "0") == "1":
        print("Migration aborted via KILL_SWITCH.")
        return

    async with engine.connect() as conn:
        while True:
            # Check Kill Switch again to be able to pause mid-flight
            if os.getenv("KILL_SWITCH_MIGRATION", "0") == "1":
                print("Migration aborted mid-flight via KILL_SWITCH.")
                break

            # Select batch
            query = text("""
                SELECT id, tenant_id, client_id, content 
                FROM protocols 
                WHERE type = 'ROUTINE' AND CAST(id AS TEXT) > :last_id
                ORDER BY CAST(id AS TEXT) ASC
                LIMIT :batch_size
            """)
            result = await conn.execute(query, {"last_id": last_processed_id, "batch_size": batch_size})
            rows = result.fetchall()
            
            if not rows:
                print("No more rows to process.")
                break
                
            for row in rows:
                protocol_id, tenant_id, client_id, content = row
                
                # Compute hash
                content_str = json.dumps(content, sort_keys=True)
                state_hash = hashlib.sha256(content_str.encode('utf-8')).hexdigest()
                
                new_id = str(uuid.uuid4())
                
                if is_dry_run:
                    # Check if there's already an active plan with a different hash (mutated)
                    # For dry run, we just log that we would insert it.
                    # Ideally, we would check if it exists, but since it's a migration from scratch, we assume insertion.
                    total_migrated += 1
                    with open(audit_file, "a") as f:
                        f.write(f"DRY-RUN: Would insert ActiveWorkoutPlan for protocol_id={protocol_id}, state_hash={state_hash}\n")
                else:
                    # Insert ActiveWorkoutPlan
                    insert_stmt = text("""
                        INSERT INTO active_workout_plans 
                        (id, tenant_id, client_id, origin_protocol_id, state_hash, content, status, created_at, updated_at)
                        VALUES 
                        (:id, :tenant_id, :client_id, :origin_protocol_id, :state_hash, :content, :status, NOW(), NOW())
                    """)
                    await conn.execute(insert_stmt, {
                        "id": new_id,
                        "tenant_id": tenant_id,
                        "client_id": client_id,
                        "origin_protocol_id": protocol_id,
                        "state_hash": state_hash,
                        "content": json.dumps(content),
                        "status": ActivePlanStatus.ACTIVE.value
                    })
                    total_migrated += 1
                
                last_processed_id = str(protocol_id)
            
            if not is_dry_run:
                # Commit the batch
                await conn.commit()
            
            print(f"Processed batch of {len(rows)} records. Last ID: {last_processed_id}. Sleeping 500ms...")
            time.sleep(0.5)

    print(f"Migration complete! {'(DRY RUN)' if is_dry_run else ''} Total migrated: {total_migrated}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
