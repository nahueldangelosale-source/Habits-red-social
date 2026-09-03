import requests
import json

url = "http://127.0.0.1:8000/users/create-dev"
payload = {
    "email": "admin@trinidad.com",
    "password": "admin123",
    "full_name": "Admin Supremo",
    "role": "professional"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
