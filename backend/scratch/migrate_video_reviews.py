import asyncio
from sqlalchemy import text
from app.db.database import get_db
from app.db.connection import engine

async def main():
    print("Checking video_reviews columns...")
    async with engine.connect() as conn:
        # Check columns of video_reviews
        result = await conn.execute(text("SELECT * FROM video_reviews LIMIT 0"))
        columns = list(result.keys())
        print("Existing columns:", columns)
        
        # Add status
        if "status" not in columns:
            print("Adding column status...")
            await conn.execute(text("ALTER TABLE video_reviews ADD COLUMN status VARCHAR DEFAULT 'pending'"))
            
        # Add feedback
        if "feedback" not in columns:
            print("Adding column feedback...")
            await conn.execute(text("ALTER TABLE video_reviews ADD COLUMN feedback VARCHAR"))
            
        # Add ai_priority
        if "ai_priority" not in columns:
            print("Adding column ai_priority...")
            await conn.execute(text("ALTER TABLE video_reviews ADD COLUMN ai_priority VARCHAR(10)"))
            
        # Add ai_triage_category
        if "ai_triage_category" not in columns:
            print("Adding column ai_triage_category...")
            await conn.execute(text("ALTER TABLE video_reviews ADD COLUMN ai_triage_category VARCHAR"))
            
        await conn.commit()
    print("Completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
