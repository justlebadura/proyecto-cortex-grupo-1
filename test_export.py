import requests
import json

payload = {
    "messages": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "World"}
    ]
}

try:
    res = requests.post("http://localhost:8000/export_latex", json=payload)
    print(res.status_code)
    print(res.headers)
except Exception as e:
    print("Error:", e)
