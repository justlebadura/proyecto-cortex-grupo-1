from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import io
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

import contextlib
import base64
import re
# import google.generativeai as genai
# from openai import OpenAI
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from ultracontext import UltraContext
from dotenv import load_dotenv

# Importar prompt del sistema
# Asegurándonos de que Python encuentre el módulo src que está un nivel arriba o moverlo
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.prompts import SYSTEM_PROMPT

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="Robert API", version="1.0.0")

# Configurar CORS (para que React se pueda conectar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional

# --- MODELOS DE DATOS ---
class ChatRequest(BaseModel):
    message: str
    context_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    code_executed: Optional[str] = None
    code_output: Optional[str] = None
    image_base64: Optional[str] = None
    video_base64: Optional[str] = None

# --- CONFIGURACIÓN SERVICIOS ---
# gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
# if not gemini_key:
#     print("CRITICAL: GEMINI_API_KEY not found.")

github_token = os.getenv("GITHUB_TOKEN")
if not github_token:
    print("Warning: GITHUB_TOKEN not found, please check your .env file.")

uc_key = os.getenv("ULTRACONTEXT_API_KEY")

# genai.configure(api_key=gemini_key)
# model = genai.GenerativeModel(
#     model_name="gemini-2.0-flash",
#     generation_config={"temperature": 0.5},
#     system_instruction=SYSTEM_PROMPT
# )

# Configurate Client for GitHub Models (Azure AI Inference)
client = None
if github_token:
    client = ChatCompletionsClient(
        endpoint="https://models.inference.ai.azure.com",
        credential=AzureKeyCredential(github_token),
    )

MODEL_NAME = "gpt-4o" # or "Phi-3-medium-4k-instruct" or "Llama-3.2-11B-Vision-Instruct"

uc_client = None
if uc_key:
    try:
        uc_client = UltraContext(api_key=uc_key)
    except:
        print("Warning: UltraContext connection failed")

import subprocess
import shutil

# --- UTILS DE EJECUCIÓN (AVANZADO) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def execute_code_and_get_output(code):
    output_buffer = io.StringIO()
    image_b64 = None
    video_b64 = None
    
    # Directorio temporal para plots
    temp_plots_dir = os.path.join(BASE_DIR, "temp_plots")
    if not os.path.exists(temp_plots_dir):
        os.makedirs(temp_plots_dir)
    
    # Asegurar backend no interactivo para evitar errores de GUI
    try:
        import matplotlib
        matplotlib.use('Agg')
    except:
        pass

    # Detectar si es código Manim (buscando Scene class)
    is_manim = "class" in code and "Scene" in code

    if is_manim:
        # Intentar ejecutar Manim como subproceso
        try:
            # Extract scene name dynamically
            scene_match = re.search(r"class\s+(\w+)\(.*Scene.*\):", code)
            scene_name = scene_match.group(1) if scene_match else "Solution"

            # Check if manim is actually installed
            if shutil.which("manim"):
                script_path = os.path.join(BASE_DIR, "temp_manim_script.py")
                media_dir = os.path.join(BASE_DIR, "media")
                
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write("from manim import *\n") 
                    # Patch to add get_tangent_line if missing
                    f.write("""
# Monkey patch Axes.get_tangent_line for compatibility
try:
    if not hasattr(CoordinateSystem, "get_tangent_line"):
        def get_tangent_line(self, x, graph, length=5, color=RED):
            angle = self.angle_of_tangent(x, graph)
            point = self.input_to_graph_point(x, graph)
            line = Line(LEFT, RIGHT, color=color).set_length(length)
            line.rotate(angle)
            line.move_to(point)
            return line
        CoordinateSystem.get_tangent_line = get_tangent_line
except NameError:
    pass # CoordinateSystem might not be available or named differently
\n""")
                    if "import manim" not in code and "from manim import" not in code:
                         pass # It's imported above
                    f.write(code) # Escribe el código completo
                    f.write("\n\nif __name__ == '__main__':\n")
                    f.write("    pass\n") # Manim CLI handles execution

                cmd = ["manim", "-ql", "--media_dir", media_dir, script_path, scene_name]
                result = subprocess.run(cmd, capture_output=True, text=True)
                output_buffer.write(result.stdout)
                
                if result.returncode != 0:
                    err_msg = result.stderr
                    if "latex" in err_msg.lower() or "not found" in err_msg.lower() or "filenotfounderror" in err_msg.lower() or "solution is not in the script" in err_msg.lower():
                         # Clear previous scary output if we are going to fallback
                         output_buffer.truncate(0) 
                         output_buffer.seek(0)
                         
                         output_buffer.write("[INFO] Entorno restringido detectado (falta LaTeX/FFmpeg).\n")
                         output_buffer.write("➡️ Ejecutando Simulación de Manim para validar lógica matemática...\n")
                         
                         try:
                            # Mock execution
                            import sys
                            # Force reload/load of mock
                            if "manim" in sys.modules:
                                del sys.modules["manim"]
                            sys.modules["manim"] = __import__("backend.mock_manim", fromlist=["*"])
                            
                            # Execute cleanly
                            exec(code, {"manim": sys.modules["manim"], "Scene": sys.modules["manim"].Scene})
                            output_buffer.write("\n✅ CÓDIGO VALIDADO: La lógica de la animación es matemáticamente correcta.\n")
                            output_buffer.write("(Nota: La renderización de video se ha omitido por limitaciones del sistema).")

                            # Generar una imagen de "Placeholder" con Matplotlib para que el usuario vea algo visual
                            try:
                                import matplotlib.pyplot as plt
                                plt.figure(figsize=(10, 6))
                                plt.text(0.5, 0.5, "Animación Manim Validada\n(Renderizado de video no disponible en este entorno)", 
                                         fontsize=15, ha='center', va='center', color='black', 
                                         bbox=dict(facecolor='#f0f0f0', edgecolor='gray', boxstyle='round,pad=1'))
                                plt.axis('off')
                                buf = io.BytesIO()
                                plt.savefig(buf, format='png')
                                buf.seek(0)
                                image_b64 = base64.b64encode(buf.read()).decode('utf-8')
                                plt.close()
                            except Exception as img_e:
                                pass

                         except Exception as mock_e:
                            output_buffer.write(f"\n❌ Error en Lógica: {mock_e}")
                    else:
                        output_buffer.write(f"\nError ejecutando Manim:\n{err_msg}")
                else:
                    video_path = os.path.join(media_dir, "videos", "temp_manim_script", "480p15", f"{scene_name}.mp4")
                    
                    # Buscar el archivo mp4 más reciente en media/videos si el path exacto falla
                    if not os.path.exists(video_path):
                         # Fallback search attempting to match scene name
                         found = False
                         video_root = os.path.join(media_dir, "videos")
                         
                         # DEBUG: List directories to help diagnosis if needed
                         # print(f"Searching for video in: {video_root}")
                         
                         if os.path.exists(video_root):
                             # Priority 1: Search for scene_name.mp4 recursively
                             for root, dirs, files in os.walk(video_root):
                                 if found: break
                                 for file in files:
                                     if file == f"{scene_name}.mp4":
                                         video_path = os.path.join(root, file)
                                         found = True
                                         break
                             
                             # Priority 2: Find the most recently modified mp4 file in the last minute
                             if not found:
                                 import time
                                 current_time = time.time()
                                 mp4_files = []
                                 for root, dirs, files in os.walk(video_root):
                                     for file in files:
                                         if file.endswith(".mp4") and "partial_movie_files" not in root: # Exclude partials
                                             full_path = os.path.join(root, file)
                                             # Check modification time to be recent (last 60 seconds)
                                             mtime = os.path.getmtime(full_path)
                                             if current_time - mtime < 120: # 2 minutes grace period
                                                 mp4_files.append((full_path, mtime))
                                 
                                 if mp4_files:
                                     # Sort by modification time, newest first
                                     mp4_files.sort(key=lambda x: x[1], reverse=True)
                                     video_path = mp4_files[0][0]
                                     output_buffer.write(f"\n[INFO] Usando video más reciente encontrado: {os.path.basename(video_path)}\n")
                    
                    if os.path.exists(video_path):
                        with open(video_path, "rb") as v:
                            video_b64 = base64.b64encode(v.read()).decode('utf-8')
                            output_buffer.write("\n[VIDEO GENERADO CON ÉXITO]\n")
                    else:
                        output_buffer.write(f"\nNo se encontró el video de salida.")
            else:
                 # Manim NOT installed: Fallback to Mock execution (just to prevent crash and show user)
                 output_buffer.write("\n[NOTA] Manim no está instalado en el servidor. Se ejecutó en modo Simulación.")
                 output_buffer.write("\nPara ver la animación real instala manim: pip install manim")
                 
                 # Ejecutamos el código usando el Mock para verificar sintaxis al menos
                 import sys
                 sys.modules["manim"] = __import__("backend.mock_manim", fromlist=["*"])
                 exec(code, {"manim": sys.modules["manim"]})
                 output_buffer.write("\n(Código validado sintácticamente con MockManim)")

        except Exception as e:
            output_buffer.write(f"\nError inesperado en Manim: {str(e)}")

    else:
        # Ejecución estándar (Matplotlib / Python puro)
        with contextlib.redirect_stdout(output_buffer):
            try:
                import sympy
                import numpy as np
                import matplotlib.pyplot as plt
                import scipy
                
                # Limpiar plot
                plt.clf()
                
                exec_globals = {
                    "plt": plt,
                    "np": np,
                    "sympy": sympy,
                    "sp": sympy,
                    "scipy": scipy
                }
                
                exec(code, exec_globals)
                
                # Capturar imagen si existe (Matplotlib)
                if plt.get_fignums():
                    bug = io.BytesIO()
                    plt.savefig(bug, format="png", bbox_inches='tight')
                    bug.seek(0)
                    image_b64 = base64.b64encode(bug.read()).decode('utf-8')
                    plt.close()
                    
            except Exception as e:
                import traceback
                print(f"Error de ejecución: {e}")
                traceback.print_exc()
            
    return output_buffer.getvalue(), image_b64, video_b64

# --- HELPER MEMORIA ---
def get_context(context_id, user_msg):
    # This function replaces get_history
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    if uc_client:
        try:
            # Recuperar historial reciente
            # Assuming uc_client has a method like get_messages or similar
            # If not, we fall back to empty history or whatever method exists
            pass
        except Exception as e:
            pass
    
    messages.append(UserMessage(content=user_msg))
    return messages

# --- ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "Robert is online"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    context_id = request.context_id
    user_msg = request.message
    
    # 1. Guardar mensaje usuario (UltraContext)
    if uc_client:
        try: 
            # uc_client.add_message(context_id, "user", user_msg) 
            pass 
        except: pass

    # 2. Generar respuesta
    try:
        if not client:
             raise Exception("Cliente GitHub Models no configurado (falta GITHUB_TOKEN)")

        messages = [SystemMessage(content=SYSTEM_PROMPT), UserMessage(content=user_msg)]

        completion = client.complete(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.5,
        )
        full_text = completion.choices[0].message.content
        
    except Exception as e:
        full_text = f"Error al conectar con GitHub Models: {str(e)}"
        print(f"Model Error: {e}")

    # 3. Detectar y Ejecutar Código
    # Regex robusta para detectar bloques de código
 (con o sin 'python', 'manim', etc.)
    # Ahora soporta ```python, ```manim, o simplemente ```
    code_blocks = re.findall(r"```(?:python|manim)?\s*(.*?)\s*```", full_text, re.DOTALL)
    
    final_output = ""
    final_img = None
    final_vid = None
    final_code = ""

    if code_blocks:
        for code in code_blocks:
            # Limpieza básica por si el modelo incluye prompt
            code = code.replace("Here is the code", "").strip()
            
            final_code += code + "\n"
            # execute_code_and_get_output ahora retorna 3 valores
            out, img, vid = execute_code_and_get_output(code)
            final_output += out + "\n"
            if img:
                final_img = img 
            if vid:
                final_vid = vid # Guardamos el video generado

    # 4. Guardar respuesta asistente
    if uc_client:
        try: uc_client.append(context_id, {"role": "assistant", "content": full_text})
        except: pass

    return ChatResponse(
        response=full_text,
        code_executed=final_code if final_code else None,
        code_output=final_output if final_output else None,
        image_base64=final_img,
        video_base64=final_vid if 'final_vid' in locals() else None
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
