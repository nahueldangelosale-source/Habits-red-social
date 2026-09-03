import asyncio
from sqlalchemy import text
from app.db.database import engine

async def run_audit():
    print("=" * 80)
    print("  AUDITORIA TOTAL - CLIENTE 0 - MODULO GYM")
    print("=" * 80)
    async with engine.connect() as conn:
        # 1. Tenants
        print("\n--- 1. TENANTS ---")
        result = await conn.execute(text("SELECT id, name, slug, plan_tier, subscription_tier, subscription_status, compute_units_balance, primary_color, currency FROM tenants"))
        tenants = result.fetchall()
        for t in tenants:
            print(f"  ID: {t[0]}\n  Name: {t[1]}\n  Slug: {t[2]}\n  Plan: {t[3]}\n  Tier: {t[4]}\n  Status: {t[5]}\n  CU Balance: {t[6]}\n  Color: {t[7]}\n  Currency: {t[8]}")
            
        # 2. Users
        print("\n--- 2. USERS ---")
        result = await conn.execute(text("SELECT id, email, first_name, last_name, is_superuser, is_active, is_verified, vital_points, streak_days FROM users"))
        users = result.fetchall()
        for u in users:
            print(f"  ID: {u[0]} | {u[2]} {u[3]} | {u[1]} | Super: {u[4]} | Active: {u[5]} | Verified: {u[6]} | VP: {u[7]} | Streak: {u[8]}")

        # 3. User Roles
        print("\n--- 3. USER ROLES ---")
        result = await conn.execute(text("SELECT id, user_id, tenant_id, role, is_active FROM user_roles"))
        roles = result.fetchall()
        for r in roles:
            print(f"  RoleID: {r[0]} | UserID: {r[1]} | TenantID: {r[2]} | Role: {r[3]} | Active: {r[4]}")

        # 4. Professionals
        print("\n--- 4. PROFESSIONALS ---")
        result = await conn.execute(text("SELECT id, tenant_id, first_name, last_name, email, specialty, service_type, subscription_status, bio, coaching_style FROM professionals"))
        pros = result.fetchall()
        for p in pros:
            print(f"  ID: {p[0]} | Tenant: {p[1]} | {p[2]} {p[3]} | {p[4]} | Spec: {p[5]} | Service: {p[6]} | Sub: {p[7]}")
            print(f"    Bio: {p[8]} | Style: {p[9]}")

        # 5. Clients
        print("\n--- 5. CLIENTS ---")
        result = await conn.execute(text("SELECT id, tenant_id, professional_id, first_name, last_name, email, phone, payment_status, is_active, coaching_status, sync_status, extra_data, height_cm, birth_date, access_expires_at FROM clients"))
        clients = result.fetchall()
        for c in clients:
            print(f"  ID: {c[0]}")
            print(f"    Tenant: {c[1]} | Pro: {c[2]}")
            print(f"    Name: {c[3]} {c[4]} | Email: {c[5]} | Phone: {c[6]}")
            print(f"    Payment: {c[7]} | Active: {c[8]} | Coaching: {c[9]} | Sync: {c[10]}")
            print(f"    Extra: {c[11]} | Height: {c[12]} | DOB: {c[13]} | Expires: {c[14]}")

        # 6. Workout Sessions
        print("\n--- 6. WORKOUT SESSIONS ---")
        result = await conn.execute(text("SELECT id, client_id, started_at, ended_at, total_volume_kg, total_reps, perceived_rpe, duration_minutes FROM workout_sessions"))
        sessions = result.fetchall()
        if not sessions:
            print("  (VACIO)")
        for s in sessions:
            print(f"  Session ID: {s[0]} | Client: {s[1]} | Start: {s[2]} | End: {s[3]} | Vol: {s[4]}kg | Reps: {s[5]} | RPE: {s[6]} | Dur: {s[7]}min")

        # 7. Exercise Logs
        print("\n--- 7. EXERCISE LOGS ---")
        result = await conn.execute(text("SELECT id, session_id, exercise_name, exercise_id, sets, reps, weight_kg, load_increase_pct FROM exercise_logs"))
        logs = result.fetchall()
        if not logs:
            print("  (VACIO)")
        for l in logs:
            print(f"  Log ID: {l[0]} | Session: {l[1]} | {l[2]} | ExID: {l[3]} | {l[4]}x{l[5]} @ {l[6]}kg | Inc: {l[7]}%")

        # 8. Video Reviews
        print("\n--- 8. VIDEO REVIEWS ---")
        result = await conn.execute(text("SELECT id, client_id, professional_id, exercise_name, video_url, status, feedback, ai_priority, ai_triage_category FROM video_reviews"))
        reviews = result.fetchall()
        if not reviews:
            print("  (VACIO)")
        for r in reviews:
            print(f"  Review ID: {r[0]} | Client: {r[1]} | Pro: {r[2]} | {r[3]} | Status: {r[5]} | Priority: {r[7]} | Triage: {r[8]}")

        # 9. Protocols
        print("\n--- 9. PROTOCOLS (Rutinas/Dietas) ---")
        result = await conn.execute(text("SELECT id, client_id, type, name, description, version, is_active, starts_at, ends_at FROM protocols"))
        protocols = result.fetchall()
        if not protocols:
            print("  (VACIO)")
        for p in protocols:
            print(f"  Protocol ID: {p[0]} | Client: {p[1]} | Type: {p[2]} | Name: {p[3]} | V{p[5]} | Active: {p[6]} | {p[7]}-{p[8]}")

        # 10. Macrocycles
        print("\n--- 10. MACROCYCLES ---")
        result = await conn.execute(text("SELECT id, tenant_id, client_id, coach_id, name, status, target_tags FROM macrocycles"))
        macros = result.fetchall()
        if not macros:
            print("  (VACIO)")
        for m in macros:
            print(f"  Macro ID: {m[0]} | Tenant: {m[1]} | Client: {m[2]} | Coach: {m[3]} | {m[4]} | Status: {m[5]} | Tags: {m[6]}")

        # 11. Athlete Drafts
        print("\n--- 11. ATHLETE DRAFTS (Swap Engine Inbox) ---")
        result = await conn.execute(text("SELECT id, tenant_id, client_id, training_experience, training_days_available, risk_score, status, habit_anchor, medical_tags, goal_tags FROM athlete_drafts"))
        drafts = result.fetchall()
        if not drafts:
            print("  (VACIO)")
        for d in drafts:
            print(f"  Draft ID: {d[0]} | Client: {d[2]} | Exp: {d[3]} | Days: {d[4]} | Risk: {d[5]} | Status: {d[6]} | Anchor: {d[7]}")
            print(f"    Medical: {d[8]} | Goals: {d[9]}")

        # 12. Financial Transactions
        print("\n--- 12. FINANCIAL TRANSACTIONS ---")
        result = await conn.execute(text("SELECT id, tenant_id, client_id, amount_total, amount_pro, amount_platform, currency, provider, status, created_at FROM financial_transactions"))
        txns = result.fetchall()
        if not txns:
            print("  (VACIO)")
        for t in txns:
            print(f"  TX ID: {t[0]} | Tenant: {t[1]} | Client: {t[2]} | Total: {t[3]} | Pro: {t[4]} | Platform: {t[5]} | {t[6]} | {t[7]} | {t[8]} | {t[9]}")

        # 13. Exercises Count
        print("\n--- 13. EXERCISES VAULT ---")
        result = await conn.execute(text("SELECT count(*) FROM exercises"))
        ex_count = result.scalar()
        print(f"  Total Exercises in DB: {ex_count}")

        # 14. Injury Matrix
        print("\n--- 14. INJURY MATRIX ---")
        result = await conn.execute(text("SELECT count(*) FROM injury_matrix"))
        inj_count = result.scalar()
        print(f"  Total Injury Rules: {inj_count}")

        # 15. Payments table
        print("\n--- 15. PAYMENTS (B2C) ---")
        try:
            result = await conn.execute(text("SELECT count(*) FROM payments"))
            pay_count = result.scalar()
            print(f"  Total Payments: {pay_count}")
        except Exception as e:
            print(f"  Error: {e}")

        # 16. Chart Records
        print("\n--- 16. CHART RECORDS (Voice-to-Chart) ---")
        result = await conn.execute(text("SELECT count(*) FROM chart_records"))
        chart_count = result.scalar()
        print(f"  Total Chart Records: {chart_count}")

        # 17. All tables overview
        print("\n--- 17. ALL TABLES IN DATABASE ---")
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = result.fetchall()
        for t in tables:
            print(f"  - {t[0]}")

    print("\n" + "=" * 80)
    print("  AUDITORIA FINALIZADA")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_audit())
