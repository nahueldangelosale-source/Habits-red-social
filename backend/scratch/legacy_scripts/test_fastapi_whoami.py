import asyncio
import os
import sys
import uuid
import traceback
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.auth import router
from app.middleware.auth import create_access_token

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def run_test():
    try:
        # Generate token by logging in
        res_login = client.post("/token", data={"username": "gino@example.com", "password": "admin123"})
        print(f"Login Status: {res_login.status_code}")
        if res_login.status_code != 200:
            print(res_login.text)
            return
            
        token = res_login.json()["access_token"]
        
        res = client.get("/api/auth/whoami", headers={"Authorization": f"Bearer {token}"})
        print(f"Whoami Status: {res.status_code}")
        print(res.text)
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
