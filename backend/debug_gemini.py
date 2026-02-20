
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Add parent dir to path to find .env if it's there? No, usually .env is in root.
# Load .env from parent directory
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("Error: No API Key found")
    sys.exit(1)

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Hello, do you work?")
    print("Success! Response:")
    print(response.text)
except Exception as e:
    print("Error calling Gemini API:")
    print(e)
