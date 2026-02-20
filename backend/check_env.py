import os
import shutil
import subprocess
import sys

print(f"Python executable: {sys.executable}")
print(f"PATH within python: {os.environ.get('PATH')}")
manim_path = shutil.which('manim')
print(f"Manim path via shutil: {manim_path}")

cmd = ["manim", "--version"]
try:
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Manim version output: {res.stdout.strip()}")
    print(f"Manim return code: {res.returncode}")
    if res.stderr:
        print(f"Manim stderr: {res.stderr}")
except Exception as e:
    print(f"Error running manim command: {e}")
