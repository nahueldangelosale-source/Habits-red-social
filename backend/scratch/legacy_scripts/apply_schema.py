

import psycopg2
import os
import re

# Hardcoded for reliability or fetch from env
# DATABASE_URL from .env: postgresql+asyncpg://neondb_owner:npg_IZT6Y5UHDNEW@ep-morning-bar-aijoseqb-pooler.c-4.us-east-1.aws.neon.tech/neondb?ssl=require
# We replace postgresql+asyncpg:// with postgresql:// for pure asyncpg/psycopg2
DATABASE_URL = "postgresql://neondb_owner:npg_IZT6Y5UHDNEW@ep-morning-bar-aijoseqb-pooler.c-4.us-east-1.aws.neon.tech/neondb?ssl=require"

def main():
    print("Applying schema.sql (SYNC)...")
    
    # Read Schema
    try:
        with open('schema.sql', 'r', encoding='utf-16le') as f:
            sql = f.read()
    except Exception as e:
        print(f"Failed to read utf-16le, trying utf-8: {e}")
        with open('schema.sql', 'r', encoding='utf-8') as f:
            sql = f.read()
            
    print(f"Read {len(sql)} chars of SQL.")
    
    # Connect
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected to DB.")
        
        # Execute
        with conn.cursor() as cur:
            cur.execute(sql)
            conn.commit()
            
        print("Schema applied successfully!")
        conn.close()
    except Exception as e:
        print(f"Error applying schema: {e}")
        # Check if "already exists" is the error, if so, ignore?
        if "already exists" in str(e):
            print("Assuming partially applied schema, proceeding.")
        else:
            raise

if __name__ == "__main__":
    main()

