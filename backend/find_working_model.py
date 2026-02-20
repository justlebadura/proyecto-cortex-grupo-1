
import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

candidates = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
]

for model_name in candidates:
    print(f"Trying {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi")
        print(f"SUCCESS with {model_name}!")
        break
    except Exception as e:
        print(f"Failed {model_name}: {str(e)[:100]}...")
        time.sleep(1)
