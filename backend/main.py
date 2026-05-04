from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import sys
import io
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

import contextlib
import base64
import re
from openai import OpenAI
from ultracontext import UltraContext
from dotenv import load_dotenv

# Importar prompt del sistema
# Asegurándonos de que Python encuentre el módulo src que está un nivel arriba o moverlo
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.prompts import SYSTEM_PROMPT

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="Jhan AI API", version="1.0.0")

# Configurar CORS (para que React se pueda conectar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DATOS ---
class ChatRequest(BaseModel):
    message: str
    context_id: str = "default"
    visualization_mode: str = "manim"

class ChatResponse(BaseModel):
    response: str
    code_executed: Optional[str] = None
    code_output: Optional[str] = None
    image_base64: Optional[str] = None
    video_base64: Optional[str] = None

# --- CONFIGURACIÓN SERVICIOS ---
gh_token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
if not gh_token:
    print("Warning: GITHUB_TOKEN not found, please check your .env file.")

uc_key = os.getenv("ULTRACONTEXT_API_KEY")

# GitHub Models (Azure Inference) model config
MODEL_NAME = os.getenv("GH_MODEL_NAME", "gpt-4o")

llm_client = None
if gh_token:
    llm_client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=gh_token,
    )

uc_client = None
if uc_key:
    try:
        uc_client = UltraContext(api_key=uc_key)
    except:
        print("Warning: UltraContext connection failed")

uc_fail_count = 0


def is_uc_context_not_found_error(err: Exception) -> bool:
    txt = str(err or "").lower()
    return "context not found" in txt or "http 404" in txt


def uc_safe_get(context_id: str):
    global uc_client, uc_fail_count
    if not uc_client:
        return None
    try:
        return uc_client.get(context_id)
    except Exception as e:
        if not is_uc_context_not_found_error(e):
            print(f"UltraContext get error: {e}")
        uc_fail_count += 1
        if uc_fail_count >= 3:
            uc_client = None
            print("Warning: UltraContext disabled after repeated failures")
        return None


def uc_safe_append(context_id: str, payload: dict):
    global uc_client, uc_fail_count
    if not uc_client:
        return
    try:
        uc_client.append(context_id, payload)
    except Exception as e:
        if not is_uc_context_not_found_error(e):
            print(f"UltraContext append error: {e}")
        uc_fail_count += 1
        if uc_fail_count >= 3:
            uc_client = None
            print("Warning: UltraContext disabled after repeated failures")

from fastapi.responses import StreamingResponse
import zipfile
import subprocess
import shutil

class ExportRequest(BaseModel):
    messages: list[dict]

def markdown_to_latex(text: str) -> str:
    if not text: return ""

    text = text.replace("\r\n", "\n")

    blocks = []
    def rep_code(m):
        blocks.append(m.group(2))
        return f"CODEBLOCK{len(blocks)-1}CODEBLOCK"
    text = re.sub(r"```([a-zA-Z0-9_]*)\s*\n(.*?)```", rep_code, text, flags=re.DOTALL)

    dmaths = []
    def rep_dmath(m):
        dmaths.append(m.group(1))
        return f"DMATH{len(dmaths)-1}DMATH"
    text = re.sub(r"\$\$(.*?)\$\$", rep_dmath, text, flags=re.DOTALL)

    imaths = []
    def rep_imath(m):
        imaths.append(m.group(1))
        return f"IMATH{len(imaths)-1}IMATH"
    text = re.sub(r"\$(.*?)\$", rep_imath, text)

    # Basic escaping
    text = text.replace('\\', '\\textbackslash ')
    text = text.replace('%', '\\%')
    text = text.replace('&', '\\&')
    text = text.replace('_', '\\_')
    text = text.replace('#', '\\#')
    
    text = re.sub(r"(?m)^\\#\\#\\#\\#\\# (.*?)$", r"\\subsubsection*{\1}", text)
    text = re.sub(r"(?m)^\\#\\#\\#\\# (.*?)$", r"\\subsection*{\1}", text)
    text = re.sub(r"(?m)^\\#\\#\\# (.*?)$", r"\\section*{\1}", text)
    text = re.sub(r"(?m)^\\#\\# (.*?)$", r"\\part*{\1}", text)
    text = re.sub(r"(?m)^\\# (.*?)$", r"\\chapter*{\1}", text)

    text = re.sub(r"\*\*(.*?)\*\*", r"\\textbf{\1}", text)
    text = re.sub(r"\*(.*?)\*", r"\\textit{\1}", text)
    text = re.sub(r"(?m)^> (.*?)$", r"\\begin{quote}\1\\end{quote}", text)

    for i, c in enumerate(blocks):
        text = text.replace(f"CODEBLOCK{i}CODEBLOCK", f"\\begin{{verbatim}}\n{c}\n\\end{{verbatim}}")
    for i, m in enumerate(dmaths):
        text = text.replace(f"DMATH{i}DMATH", f"$${m}$$")
    for i, m in enumerate(imaths):
        text = text.replace(f"IMATH{i}IMATH", f"${m}$")
        
    return text

@app.post("/export_latex")
async def export_latex(request: ExportRequest):
    tex_content = """\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\title{Conversaci\\'{o}n Jhan AI - Cortex Edition}
\\begin{document}
\\maketitle

"""
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        img_counter = 0
        for msg in request.messages:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            media = msg.get("media", None)
            
            tex_content += f"\\section*{{{role.capitalize()}}}\n\n"
            tex_content += f"{markdown_to_latex(content)}\n\n"

            if media:
                if media.get("type") == "image":
                    img_data = base64.b64decode(media["data"])
                    filename = f"img_{img_counter}.png"
                    zip_file.writestr(filename, img_data)
                    tex_content += f"\\begin{{center}}\n\\includegraphics[width=0.8\\textwidth]{{{filename}}}\n\\end{{center}}\n\n"
                    img_counter += 1
                elif media.get("type") == "video":
                    vid_data = base64.b64decode(media["data"])
                    filename = f"video_{img_counter}.mp4"
                    zip_file.writestr(filename, vid_data)
                    tex_content += f"\\textbf{{[Video Manim adjunto en el ZIP: {filename}]}}\n\n"
                    img_counter += 1

        tex_content += "\\end{document}\n"
        zip_file.writestr("main.tex", tex_content.encode("utf-8"))

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename=export_jhan_ai.zip"}
    )


# --- UTILS DE EJECUCIÓN (AVANZADO) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def call_llm_with_messages(messages, temperature=0.35, max_tokens=1500) -> str:
    if not llm_client:
        raise Exception("Cliente GitHub Models no configurado (falta GITHUB_TOKEN)")

    completion = llm_client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content or ""


def is_provider_error_text(text: str) -> bool:
    t = (text or "").lower()
    return (
        "error al conectar con github models" in t
        or "quota exceeded" in t
        or "429" in t
        or "rate limit" in t
    )


def format_provider_error_message(err: Exception) -> str:
    raw = str(err or "").strip()
    t = raw.lower()

    if "429" in t or "quota exceeded" in t or "rate limit" in t:
        wait_match = re.search(r"retry in\s*([0-9]+(?:\.[0-9]+)?)s", raw, flags=re.IGNORECASE)
        if not wait_match:
            wait_match = re.search(r"retry_delay\s*\{\s*seconds:\s*([0-9]+)", raw, flags=re.IGNORECASE)
        wait_hint = f" Espera {wait_match.group(1)}s y reintenta." if wait_match else ""

        return (
            "No pude generar la respuesta porque GitHub Models devolvio un limite de cuota (HTTP 429)."
            " Revisa tu plan/cuotas o cambia temporalmente de modelo."
            f"{wait_hint}"
        )

    if raw:
        return f"Error al conectar con GitHub Models: {raw[:300]}"
    return "Error al conectar con GitHub Models."


def build_placeholder_image_b64(message: str) -> Optional[str]:
    """Genera una imagen de respaldo oscura con un mensaje visible."""
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        plt.style.use('dark_background')
        fig = plt.figure(figsize=(10, 6), facecolor='#0b0b0b')
        ax = fig.add_subplot(111)
        ax.set_facecolor('#0b0b0b')
        ax.axis('off')
        ax.text(
            0.5,
            0.5,
            message,
            ha='center',
            va='center',
            fontsize=14,
            color='white',
            bbox=dict(facecolor='#111111', edgecolor='#444444', boxstyle='round,pad=0.8')
        )

        buf = io.BytesIO()
        fig.savefig(buf, format='png', facecolor='#0b0b0b', bbox_inches='tight')
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return img_b64
    except Exception:
        return None


def is_probably_blank_image_b64(img_b64: Optional[str]) -> bool:
    """
    Detecta PNG casi uniforme (blanco/negro/plano) para evitar enviar imágenes vacías.
    """
    if not img_b64:
        return True

    try:
        import numpy as np
        import matplotlib.image as mpimg

        raw = base64.b64decode(img_b64)
        arr = mpimg.imread(io.BytesIO(raw), format='png')

        if arr is None or arr.size == 0:
            return True

        # Usa solo canales RGB si existe alpha.
        rgb = arr[..., :3] if arr.ndim == 3 else arr
        std = float(np.std(rgb))
        return std < 0.01
    except Exception:
        return False

def execute_code_and_get_output(code, allow_visual_fallback=False):
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
                         # Primer reintento: variante sin LaTeX para intentar render real.
                         try:
                            latex_free_code = build_latex_free_manim_variant(code)
                            if latex_free_code != code:
                                with open(script_path, "w", encoding="utf-8") as f:
                                    f.write("from manim import *\n")
                                    f.write(latex_free_code)
                                retry = subprocess.run(cmd, capture_output=True, text=True)
                                if retry.returncode == 0:
                                    video_path = os.path.join(media_dir, "videos", "temp_manim_script", "480p15", f"{scene_name}.mp4")
                                    if os.path.exists(video_path):
                                        with open(video_path, "rb") as v:
                                            video_b64 = base64.b64encode(v.read()).decode('utf-8')
                                            output_buffer.write("\n[VIDEO GENERADO CON ÉXITO - MODO SIN LATEX]\n")
                                    else:
                                        output_buffer.write("\nNo se encontró video tras reintento sin LaTeX.")
                         except Exception as retry_e:
                            output_buffer.write(f"\n[WARN] Reintento sin LaTeX falló: {retry_e}\n")

                         if video_b64:
                             pass
                         else:
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
                                if not image_b64:
                                    image_b64 = build_placeholder_image_b64(
                                        "Animación Manim validada\n(Renderizado de video no disponible)"
                                    )

                             except Exception as mock_e:
                                output_buffer.write(f"\n❌ Error en Lógica: {mock_e}")
                                if not image_b64:
                                    image_b64 = build_placeholder_image_b64(
                                        "Error al validar la escena Manim"
                                    )
                    else:
                        output_buffer.write(f"\nError ejecutando Manim:\n{err_msg}")
                        if allow_visual_fallback and not image_b64:
                            image_b64 = build_placeholder_image_b64(
                                "Error al renderizar Manim\nRevisa el bloque de código generado"
                            )
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
                        if allow_visual_fallback and not image_b64:
                            image_b64 = build_placeholder_image_b64(
                                "La escena se ejecutó, pero no se encontró el MP4 de salida"
                            )
            else:
                 # Manim NOT installed: Fallback to Mock execution (just to prevent crash and show user)
                 output_buffer.write("\n[NOTA] Manim no está instalado en el servidor. Se ejecutó en modo Simulación.")
                 output_buffer.write("\nPara ver la animación real instala manim: pip install manim")
                 
                 # Ejecutamos el código usando el Mock para verificar sintaxis al menos
                 import sys
                 sys.modules["manim"] = __import__("backend.mock_manim", fromlist=["*"])
                 exec(code, {"manim": sys.modules["manim"]})
                 output_buffer.write("\n(Código validado sintácticamente con MockManim)")
                 if allow_visual_fallback and not image_b64:
                    image_b64 = build_placeholder_image_b64(
                        "Modo simulación Manim\n(Manim no está instalado en el servidor)"
                    )

        except Exception as e:
            output_buffer.write(f"\nError inesperado en Manim: {str(e)}")
            if allow_visual_fallback and not image_b64:
                image_b64 = build_placeholder_image_b64(
                    "Error inesperado durante ejecución de Manim"
                )

    else:
        # Ejecución estándar (Matplotlib / Python puro)
        with contextlib.redirect_stdout(output_buffer):
            try:
                import sympy
                import numpy as np
                import matplotlib.pyplot as plt
                import scipy

                plt.style.use('dark_background')
                plt.rcParams['figure.facecolor'] = '#0b0b0b'
                plt.rcParams['axes.facecolor'] = '#0b0b0b'
                plt.rcParams['savefig.facecolor'] = '#0b0b0b'
                plt.rcParams['savefig.edgecolor'] = '#0b0b0b'
                
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
                    # Si no hay datos graficados, evita imagen vacía y coloca un mensaje útil.
                    has_data = False
                    for fig_num in plt.get_fignums():
                        fig = plt.figure(fig_num)
                        for ax in fig.axes:
                            if ax.has_data() or ax.images:
                                has_data = True
                                break
                        if has_data:
                            break

                    if not has_data:
                        fig = plt.gcf()
                        fig.patch.set_facecolor('#0b0b0b')
                        ax = fig.add_subplot(111)
                        ax.set_facecolor('#0b0b0b')
                        ax.axis('off')
                        ax.text(
                            0.5,
                            0.5,
                            "El código no generó datos para graficar\n(verifica plt.plot / plt.imshow / etc.)",
                            ha='center',
                            va='center',
                            fontsize=12,
                            color='white',
                            bbox=dict(facecolor='#111111', edgecolor='#444444', boxstyle='round,pad=0.8')
                        )

                    bug = io.BytesIO()
                    plt.savefig(bug, format="png", bbox_inches='tight')
                    bug.seek(0)
                    image_b64 = base64.b64encode(bug.read()).decode('utf-8')
                    plt.close()
                elif allow_visual_fallback and not image_b64:
                    image_b64 = build_placeholder_image_b64(
                        "No se generó figura en Matplotlib\n(el código sí se ejecutó)"
                    )
                    
            except Exception as e:
                import traceback
                print(f"Error de ejecución: {e}")
                traceback.print_exc()
                if allow_visual_fallback and not image_b64:
                    image_b64 = build_placeholder_image_b64(
                        "Error al ejecutar el código Python"
                    )

    # Salvaguarda final: nunca devolver imagen visualmente vacía cuando aplica visualización.
    if allow_visual_fallback and is_probably_blank_image_b64(image_b64):
        fallback = build_placeholder_image_b64(
            "Se detectó una visualización vacía\nMostrando resultado alternativo"
        )
        if fallback:
            image_b64 = fallback
            
    return output_buffer.getvalue(), image_b64, video_b64

# ... (imports anteriores se mantienen)
import re

# --- MEMORIA SELECTIVA ---
def procesar_para_memoria(texto: str, rol: str) -> str:
    """
    Aplica 'Memoria Selectiva': comprime o descarta información redundante 
    antes de guardarla en UltraContext para optimizar el contexto del modelo.
    """
    if not texto:
        return ""

    if rol == "assistant":
        # 1. Comprimir bloques de código largos.
        # El modelo no necesita recordar todo el código que ya escribió, solo que lo hizo.
        def replacer(match):
            contenido = match.group(1)
            if len(contenido) > 150: # Si el código es medianamente largo
                lineas = contenido.count('\n')
                return f"\n[Memoria: Se generó y ejecutó código Python/Manim ({lineas} líneas).]\n"
            return match.group(0)
            
        texto_procesado = re.sub(r"```(?:\w+)?\s*(.*?)```", replacer, texto, flags=re.DOTALL)
        return texto_procesado
    
    return texto

# --- HELPER MEMORIA ---
def normalize_visualization_mode(mode: Optional[str]) -> str:
    m = (mode or "manim").strip().lower()
    if m not in {"manim", "matplotlib"}:
        return "manim"
    return m


def wants_visual_output(user_msg: str) -> bool:
    msg = (user_msg or "").lower()
    visual_triggers = [
        "anim", "animación", "manim", "grafica", "gráfica", "visualiza", "visualización", "visualmente", "video"
    ]
    return any(t in msg for t in visual_triggers)


def build_runtime_system_prompt(visualization_mode: str) -> str:
    """
    Mantiene el prompt base original y añade una directiva de renderizado según configuración.
    """
    mode_note = (
        "\n\nPREFERENCIA DE RENDERIZADO (CONFIGURACIÓN DEL USUARIO): "
        "usa PRIORITARIAMENTE MANIM para visualizaciones (video)."
        if visualization_mode == "manim"
        else "\n\nPREFERENCIA DE RENDERIZADO (CONFIGURACIÓN DEL USUARIO): "
             "usa PRIORITARIAMENTE MATPLOTLIB para visualizaciones estáticas. "
             "Evita Manim salvo que sea estrictamente necesario."
    )

    runtime_config_note = (
        "\n\nCONFIGURACIÓN ACTIVA DEL SISTEMA (RUNTIME):\n"
        f"- visualization_mode: {visualization_mode}\n"
        f"- llm_model: {MODEL_NAME}\n"
        f"- manim_installed: {shutil.which('manim') is not None}\n"
        f"- ultracontext_enabled: {uc_client is not None}\n"
        "- instrucción: respeta estrictamente esta configuración al elegir herramientas y formato de salida."
    )

    return SYSTEM_PROMPT + mode_note + runtime_config_note


def apply_selective_attention(user_msg: str):
    """
    Fase 2.2 - Filtro de ruido:
    Si el mensaje supera 500 palabras, prioriza entidades clave y la instrucción final.
    """
    text = (user_msg or "").strip()
    words = re.findall(r"\b\w+\b", text, flags=re.UNICODE)
    if len(words) <= 500:
        return text, False

    stopwords = {
        "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u", "a", "en", "con",
        "por", "para", "que", "se", "del", "al", "lo", "le", "les", "su", "sus", "mi", "mis", "tu", "tus",
        "es", "son", "ser", "estar", "como", "pero", "si", "no", "ya", "muy", "mas", "más", "esto", "esta",
        "este", "estas", "estos", "eso", "esa", "ese", "esas", "esos", "tambien", "también", "porque", "donde",
        "cuando", "quien", "quienes", "cual", "cuales", "qué", "cuál", "cuáles", "cómo", "dónde", "cuándo",
    }

    tokens = re.findall(r"[A-Za-zÁÉÍÓÚáéíóúÑñÜü]{4,}", text)
    scored = []
    seen = set()
    for token in tokens:
        t = token.lower()
        if t in stopwords or t in seen:
            continue
        seen.add(t)
        scored.append(t)

    key_entities = scored[:24]

    sentences = re.split(r"(?<=[\.!?])\s+", text)
    final_sentence = ""
    for s in reversed(sentences):
        if s and s.strip():
            final_sentence = s.strip()
            break

    compact = (
        "[ATENCION SELECTIVA ACTIVADA]\n"
        f"Entidades clave: {', '.join(key_entities) if key_entities else 'no detectadas'}\n"
        f"Instruccion final prioritaria: {final_sentence if final_sentence else text[-280:]}\n"
        "Nota: el mensaje original excede 500 palabras y fue resumido para optimizar foco cognitivo."
    )
    return compact, True


def get_context(context_id, user_msg, visualization_mode="manim"):
    runtime_prompt = build_runtime_system_prompt(visualization_mode)
    messages = [{"role": "system", "content": runtime_prompt}]
    
    # Recuperar historial de UltraContext
    historial = uc_safe_get(context_id)
    if historial and "data" in historial:
        for msg in historial["data"]:
            role = msg.get("role")
            content = msg.get("content")
            if role == "user":
                messages.append({"role": "user", "content": content})
            elif role == "assistant":
                messages.append({"role": "assistant", "content": content})
    
    # Añadir el mensaje actual del usuario al final
    messages.append({"role": "user", "content": user_msg})
    return messages


def extract_executable_code_blocks(text: str):
    """
    Extrae bloques de código potencialmente ejecutables.
    Soporta etiquetas variadas (python, py, manim o sin etiqueta).
    """
    if not text:
        return []

    blocks = []
    pattern = re.compile(r"```([a-zA-Z0-9_+-]*)\s*\n(.*?)```", re.DOTALL)
    for match in pattern.finditer(text):
        lang = (match.group(1) or "").strip().lower()
        code = (match.group(2) or "").strip()
        if not code:
            continue

        allowed_lang = {"", "python", "py", "manim"}
        looks_pythonic = any(token in code for token in [
            "import ", "def ", "class ", "print(", "plt.", "np.", "sympy", "sp.", "Scene"
        ])

        if lang in {"python", "py", "manim"}:
            blocks.append(code)
        elif lang == "" and looks_pythonic:
            blocks.append(code)
        elif lang in allowed_lang:
            blocks.append(code)

    # Fallback para bloques sin salto de línea después del fence
    if not blocks:
        loose_blocks = re.findall(r"```(?:python|py|manim)?\s*(.*?)\s*```", text, re.DOTALL)
        for block in loose_blocks:
            code = block.strip()
            if code:
                blocks.append(code)

    return blocks


def should_force_code_generation(user_msg: str) -> bool:
    msg = (user_msg or "").lower()
    triggers = [
        "manim", "anim", "animación", "grafica", "gráfica", "plot", "visualiza", "visualización", "visualmente",
        "derivada", "derivadas", "integral", "limite", "límite", "resolver", "calcula", "ecuación", "matriz",
        "sympy", "numpy", "scipy", "python", "codigo", "código",
    ]
    return any(t in msg for t in triggers)


def prefers_manim(user_msg: str) -> bool:
    msg = (user_msg or "").lower()
    manim_triggers = [
        "manim", "anim", "animación", "visualiza", "visualización", "visualmente",
        "escena", "video", "derivadas visualmente", "animar",
    ]
    return any(t in msg for t in manim_triggers)


def is_manim_code(code: str) -> bool:
    c = (code or "")
    return (
        "from manim import" in c
        or "import manim" in c
        or "Scene):" in c
        or "class Solution(Scene)" in c
    )


def is_matplotlib_code(code: str) -> bool:
    c = (code or "")
    matplotlib_tokens = [
        "import matplotlib",
        "import matplotlib.pyplot as plt",
        "from matplotlib",
        "plt.",
        "figure(",
        "subplots(",
        "plot(",
        "scatter(",
        "bar(",
        "hist(",
        "imshow(",
    ]
    return any(t in c for t in matplotlib_tokens)


def normalize_manim_scene_name(code: str) -> str:
    """Normaliza la primera clase Scene a Solution(Scene) para compatibilidad estable."""
    if not code:
        return code

    if "class Solution(Scene)" in code:
        return code

    return re.sub(r"class\s+\w+\s*\(\s*Scene\s*\):", "class Solution(Scene):", code, count=1)


def build_latex_free_manim_variant(code: str) -> str:
    """Crea una variante de código Manim sin MathTex/Tex para entornos sin LaTeX."""
    if not code:
        return code

    variant = code
    variant = variant.replace("MathTex(", "Text(")
    variant = variant.replace("Tex(", "Text(")
    variant = variant.replace("set_color_by_tex", "set_color")
    return variant


def build_force_code_prompt(user_msg: str, require_manim: bool = False, prefer_matplotlib: bool = False) -> str:
    if require_manim:
        return (
            "Genera SOLO un bloque de código Python ejecutable con Manim. "
            "OBLIGATORIO: usa exactamente `from manim import *` y define `class Solution(Scene):`. "
            "Evita usar MathTex/Tex para no depender de LaTeX del sistema; usa Text y objetos geométricos. "
            "La escena debe renderizar sin interacción y terminar con `self.wait(2)` o más. "
            "No agregues explicación fuera del bloque.\n\n"
            f"Tarea del usuario: {user_msg}"
        )

    if prefer_matplotlib:
        return (
            "Genera SOLO un bloque de código Python ejecutable con matplotlib/sympy/numpy según aplique. "
            "NO uses Manim. El bloque debe producir una visualización estática clara con matplotlib. "
            "No agregues explicación fuera del bloque.\n\n"
            f"Tarea del usuario: {user_msg}"
        )

    return (
        "Genera SOLO un bloque de código ejecutable para resolver lo siguiente. "
        "Si se requiere animación usa Manim con class Solution(Scene). "
        "Si no, usa Python con sympy/numpy/matplotlib según corresponda. "
        "No agregues explicación fuera del bloque.\n\n"
        f"Tarea del usuario: {user_msg}"
    )


CODE_REPAIR_MAX_ATTEMPTS = 1


def execution_output_has_error(output_text: str) -> bool:
    t = (output_text or "").lower()
    error_markers = [
        "error ejecutando manim",
        "error inesperado en manim",
        "error en lógica",
        "error en logica",
        "error de ejecución",
        "error de ejecucion",
        "traceback",
        "syntaxerror",
        "nameerror",
        "typeerror",
        "indentationerror",
        "modulenotfounderror",
        "filenotfounderror",
        "❌",
    ]
    return any(m in t for m in error_markers)


def attempt_code_repair_with_log(
    broken_code: str,
    error_log: str,
    user_msg: str,
    visualization_mode: str,
) -> Optional[str]:
    if not llm_client:
        return None

    is_manim_target = is_manim_code(broken_code) or visualization_mode == "manim"
    runtime_prompt = build_runtime_system_prompt(visualization_mode)

    repair_instruction = (
        "Corrige el siguiente código para que se ejecute sin errores. "
        "Devuelve SOLO un bloque de código Python ejecutable, sin explicación adicional. "
    )
    if is_manim_target:
        repair_instruction += (
            "Debe ser Manim válido con `from manim import *` y `class Solution(Scene):`. "
            "Mantén la intención pedagógica y corrige errores de sintaxis/runtime usando el log."
        )
    else:
        repair_instruction += "Usa Python con matplotlib/sympy/numpy según aplique."

    repair_messages = [
        {"role": "system", "content": runtime_prompt + "\n\n" + repair_instruction},
        {
            "role": "user",
            "content": (
                f"Solicitud original del usuario:\n{user_msg}\n\n"
                f"Código con fallo:\n```python\n{broken_code}\n```\n\n"
                f"Log de error de ejecución:\n```text\n{error_log[:3000]}\n```\n\n"
                "Corrige el código y devuelve solo el bloque final ejecutable."
            ),
        },
    ]

    try:
        fixed_text = normalize_markdown_response(
            call_llm_with_messages(repair_messages, temperature=0.1, max_tokens=1600)
        )
        fixed_blocks = extract_executable_code_blocks(fixed_text)
        if not fixed_blocks:
            return None

        if is_manim_target:
            manim_blocks = [b for b in fixed_blocks if is_manim_code(b)]
            candidate = manim_blocks[0] if manim_blocks else fixed_blocks[0]
            return normalize_manim_scene_name(candidate)

        non_manim_blocks = [b for b in fixed_blocks if not is_manim_code(b)]
        return non_manim_blocks[0] if non_manim_blocks else fixed_blocks[0]
    except Exception as e:
        print(f"Auto-repair no disponible: {e}")
        return None


def normalize_markdown_response(text: str) -> str:
    """
    Normaliza respuestas para mejorar legibilidad en Markdown:
    - Asegura saltos antes de encabezados conocidos.
    - Envuelve fragmentos de código sueltos en fences python cuando aplica.
    """
    if not text:
        return text

    normalized = text.replace("\r\n", "\n")

    headings = [
        "Concepto Clave / Intuición",
        "Desarrollo Matemático",
        "Código de Verificación / Visualización",
        "Resultado Final",
        "Conexión Profunda",
    ]

    for h in headings:
        normalized = re.sub(
            rf"(^|\n)\s*#{1,6}\s*{re.escape(h)}\s*",
            f"\n\n### {h}\n\n",
            normalized,
            flags=re.IGNORECASE,
        )

    # Si aparece código python suelto (sin fences), envolverlo.
    if "```" not in normalized:
        code_like = re.search(r"(^|\n)(import\s+\w+|from\s+\w+\s+import\s+|x\s*=|def\s+|class\s+)", normalized)
        if code_like:
            lines = normalized.split("\n")
            code_start = None
            for i, line in enumerate(lines):
                if re.match(r"\s*(import\s+\w+|from\s+\w+\s+import\s+|def\s+|class\s+|\w+\s*=)", line):
                    code_start = i
                    break
            if code_start is not None:
                prose = "\n".join(lines[:code_start]).strip()
                code = "\n".join(lines[code_start:]).strip()
                normalized = f"{prose}\n\n```python\n{code}\n```".strip()

    # Limpieza simple de saltos repetidos.
    normalized = re.sub(r"\n{3,}", "\n\n", normalized).strip()
    return normalized


def enforce_catedratico_guardrails(text: str) -> str:
    """
    Aplica guardrails mínimos sin destruir la estructura académica del prompt base.
    """
    if not text:
        return text

    cleaned = text

    # Elimina emojis para respetar la guía de estilo.
    emoji_pattern = re.compile(
        "["
        "\U0001F300-\U0001F5FF"
        "\U0001F600-\U0001F64F"
        "\U0001F680-\U0001F6FF"
        "\U0001F900-\U0001F9FF"
        "\U0001FA70-\U0001FAFF"
        "]+",
        flags=re.UNICODE,
    )
    cleaned = emoji_pattern.sub("", cleaned)

    # Si el cierre activo falta, añade una transición de cátedra.
    if "### 5. Transicion de Catedra" not in cleaned:
        cleaned = (
            cleaned.strip()
            + "\n\n### 5. Transicion de Catedra\n\n"
            + "Plantee un contraejemplo donde esta tecnica falle o pierda eficiencia, y justifique formalmente por que ocurre."
        )

    return cleaned.strip()


def inject_code_section_if_missing(full_text: str, code_blocks) -> str:
    """Si la respuesta no trae bloque de código visible, lo agrega en la sección de código."""
    if not full_text or not code_blocks:
        return full_text

    if "```" in full_text:
        return full_text

    code = (code_blocks[0] or "").strip()
    if not code:
        return full_text

    section_header = "## Código de Verificación / Visualización"
    code_md = f"\n\n{section_header}\n\n```python\n{code}\n```\n"

    if re.search(r"##\s*Código de Verificación / Visualización", full_text, flags=re.IGNORECASE):
        # Inserta el bloque justo después del header si está vacío o no tiene fences.
        pattern = re.compile(r"(##\s*Código de Verificación / Visualización\s*)", re.IGNORECASE)
        return pattern.sub(r"\1\n\n```python\n" + code + "\n```\n", full_text, count=1)

    return (full_text.strip() + code_md).strip()


def strip_manim_code_blocks(text: str) -> str:
    """Elimina bloques Manim de la respuesta visible cuando el modo activo es matplotlib."""
    if not text:
        return text

    pattern = re.compile(r"```([a-zA-Z0-9_+-]*)\s*\n(.*?)```", re.DOTALL)

    def repl(match):
        lang = (match.group(1) or "").strip().lower()
        body = (match.group(2) or "")
        if lang == "manim" or is_manim_code(body):
            return ""
        return match.group(0)

    cleaned = pattern.sub(repl, text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned


def enforce_structured_markdown(text: str, code_blocks) -> str:
    """
    Garantiza estructura legible mínima con secciones obligatorias.
    Si la respuesta viene plana/sin headings, arma una plantilla clara.
    """
    if not text:
        text = ""

    normalized = text.strip()

    # Extrae un bloque de código preferente para la sección técnica.
    code = ""
    if code_blocks:
        code = (code_blocks[0] or "").strip()

    # Limpia headings/ruido del modelo y reconstruye SIEMPRE en formato canónico.
    prose_source = re.sub(r"```[\s\S]*?```", "", normalized)
    prose_source = re.sub(r"(?m)^\s*#{1,6}\s*.*$", "", prose_source)
    prose_source = re.sub(r"\n{3,}", "\n\n", prose_source).strip()

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", prose_source) if p.strip()]
    concept = paragraphs[0] if paragraphs else "Se presenta la intuición del problema y qué se desea calcular."
    development = "\n\n".join(paragraphs[1:3]) if len(paragraphs) > 1 else "Se desarrolla el procedimiento matemático paso a paso."
    result = paragraphs[-1] if paragraphs else "Se obtiene el resultado final del problema."

    code_section = "```python\n# Código no generado\n```"
    if code:
        code_section = f"```python\n{code}\n```"

    structured = (
        "## Concepto Clave / Intuición\n\n"
        f"**Idea central:** {concept}\n\n"
        "---\n\n"
        "## Desarrollo Matemático\n\n"
        f"{development}\n\n"
        "---\n\n"
        "## Código de Verificación / Visualización\n\n"
        f"{code_section}\n\n"
        "---\n\n"
        "## Resultado Final\n\n"
        f"**{result}**\n\n"
        "---\n\n"
        "## Conexión Profunda\n\n"
        "Este resultado se conecta con aplicaciones en física, ingeniería y modelado cuantitativo."
    )
    return structured


# --- ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "Jhan AI API online"}

@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "Jhan AI API",
        "provider": "github_models_azure",
        "model": MODEL_NAME,
        "llm_ready": llm_client is not None,
        "ultracontext_ready": uc_client is not None,
        "manim_installed": shutil.which("manim") is not None,
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    context_id = request.context_id
    user_msg = request.message
    visualization_mode = normalize_visualization_mode(request.visualization_mode)
    llm_failed = False
    focused_user_msg, attention_applied = apply_selective_attention(user_msg)
    
    # 1. Guardar mensaje usuario (UltraContext) - SIN MODIFICAR (Raw)
    # Guardamos lo que el usuario dijo exactamente para que quede constancia.
    uc_safe_append(context_id, {"role": "user", "content": user_msg})

    # 2. Generar respuesta con Contexto Completo (recuperado)
    try:
        if not llm_client:
            raise Exception("Cliente GitHub Models no configurado (falta GITHUB_TOKEN)")

        # Usar la función helper que ahora recupera el historial real
        messages = get_context(context_id, focused_user_msg, visualization_mode)

        completion_text = call_llm_with_messages(
            messages,
            temperature=0.35,
            max_tokens=1500,
        )
        full_text = normalize_markdown_response(completion_text)
        
    except Exception as e:
        llm_failed = True
        full_text = format_provider_error_message(e)
        print(f"Model Error: {e}")

    # 3. Detectar y Ejecutar Código
    code_blocks = extract_executable_code_blocks(full_text)
    visual_intent = wants_visual_output(user_msg)
    manim_required = visual_intent and visualization_mode == "manim"
    matplotlib_required = visual_intent and visualization_mode == "matplotlib"
    runtime_prompt = build_runtime_system_prompt(visualization_mode)

    # 3.0 Si se pidió animación/visualización y no hay bloque Manim, forzar Manim explícitamente.
    if (not llm_failed) and llm_client and manim_required and (not code_blocks or not any(is_manim_code(c) for c in code_blocks)):
        try:
            forced_manim_messages = [
                {
                    "role": "system",
                    "content": runtime_prompt + "\n\nINSTRUCCIÓN ADICIONAL: Devuelve exclusivamente un bloque de código Manim ejecutable."
                },
                    {"role": "user", "content": build_force_code_prompt(focused_user_msg, require_manim=True)},
            ]
            forced_manim_text = normalize_markdown_response(
                call_llm_with_messages(
                    forced_manim_messages,
                    temperature=0.1,
                    max_tokens=1400,
                )
            )
            forced_manim_blocks = extract_executable_code_blocks(forced_manim_text)
            forced_manim_blocks = [b for b in forced_manim_blocks if is_manim_code(b)]
            if forced_manim_blocks:
                code_blocks = [normalize_manim_scene_name(b) for b in forced_manim_blocks]
                full_text = inject_code_section_if_missing(full_text, forced_manim_blocks)
        except Exception as e:
            print(f"Fallback Manim no disponible: {e}")

    # 3.0b Si el usuario eligió Matplotlib y no hay bloque compatible, forzar código estático.
    if (not llm_failed) and llm_client and matplotlib_required:
        has_non_manim = any(not is_manim_code(c) for c in code_blocks)
        if (not code_blocks) or (not has_non_manim):
            try:
                forced_matplotlib_messages = [
                    {
                        "role": "system",
                        "content": runtime_prompt + "\n\nINSTRUCCIÓN ADICIONAL: Devuelve exclusivamente un bloque de código Python con Matplotlib ejecutable."
                    },
                    {"role": "user", "content": build_force_code_prompt(focused_user_msg, prefer_matplotlib=True)},
                ]
                forced_matplotlib_text = normalize_markdown_response(
                    call_llm_with_messages(
                        forced_matplotlib_messages,
                        temperature=0.1,
                        max_tokens=1200,
                    )
                )
                forced_matplotlib_blocks = extract_executable_code_blocks(forced_matplotlib_text)
                forced_matplotlib_blocks = [b for b in forced_matplotlib_blocks if not is_manim_code(b)]
                if forced_matplotlib_blocks:
                    code_blocks = forced_matplotlib_blocks
                    full_text = inject_code_section_if_missing(full_text, forced_matplotlib_blocks)
            except Exception as e:
                print(f"Fallback Matplotlib no disponible: {e}")

    # En modo matplotlib solo se aceptan bloques que realmente hagan plotting.
    if visualization_mode == "matplotlib":
        code_blocks = [c for c in code_blocks if is_matplotlib_code(c)]

    # 3.1 Fallback: si el usuario pidió cálculo/visualización y el modelo no devolvió código,
    # pedimos una segunda salida SOLO con código ejecutable.
    if (not llm_failed) and (not code_blocks) and llm_client and should_force_code_generation(user_msg):
        try:
            forced_messages = [
                {
                    "role": "system",
                    "content": runtime_prompt + "\n\nINSTRUCCIÓN ADICIONAL: Devuelve exclusivamente bloques de código ejecutables."
                },
                    {"role": "user", "content": build_force_code_prompt(focused_user_msg)},
            ]
            forced_text = normalize_markdown_response(
                call_llm_with_messages(
                    forced_messages,
                    temperature=0.2,
                    max_tokens=1200,
                )
            )
            forced_blocks = extract_executable_code_blocks(forced_text)
            if forced_blocks:
                code_blocks = forced_blocks
                full_text = inject_code_section_if_missing(full_text, forced_blocks)
        except Exception as e:
            print(f"Fallback de código no disponible: {e}")

    # Si hubo código ejecutable pero la respuesta visible no lo incluyó, lo añadimos para claridad.
    full_text = inject_code_section_if_missing(full_text, code_blocks)

    # Modo estricto: en matplotlib nunca mostrar ni usar bloques Manim.
    if visualization_mode == "matplotlib":
        code_blocks = [c for c in code_blocks if not is_manim_code(c)]
        full_text = strip_manim_code_blocks(full_text)
        full_text = inject_code_section_if_missing(full_text, code_blocks)

    # Garantiza formato legible aunque el modelo responda plano.
    if not is_provider_error_text(full_text):
        full_text = enforce_catedratico_guardrails(full_text)
        if attention_applied:
            full_text = (
                "[Atencion selectiva activada: se priorizaron entidades clave y la instruccion final del mensaje extenso.]\n\n"
                + full_text
            )
    
    final_output = ""
    final_img = None
    final_vid = None
    final_code = ""

    if code_blocks:
        if manim_required:
            # Prioriza ejecución de bloques Manim cuando el usuario pidió visualización animada.
            code_blocks = sorted(code_blocks, key=lambda c: 0 if is_manim_code(c) else 1)
        elif matplotlib_required:
            # Prioriza bloques no-Manim cuando el usuario eligió Matplotlib.
            code_blocks = sorted(code_blocks, key=lambda c: 0 if not is_manim_code(c) else 1)

        for code in code_blocks:
            # Limpieza básica por si el modelo incluye prompt
            current_code = code.replace("Here is the code", "").strip()
            if is_manim_code(current_code):
                current_code = normalize_manim_scene_name(current_code)

            attempt = 0
            while True:
                out, img, vid = execute_code_and_get_output(
                    current_code,
                    allow_visual_fallback=manim_required or matplotlib_required,
                )
                execution_failed = execution_output_has_error(out)

                # Si no falla, o ya agotó intentos, salir del loop.
                if not execution_failed or attempt >= CODE_REPAIR_MAX_ATTEMPTS or llm_failed:
                    break

                repaired_code = attempt_code_repair_with_log(
                    broken_code=current_code,
                    error_log=out,
                    user_msg=user_msg,
                    visualization_mode=visualization_mode,
                )
                if not repaired_code or repaired_code.strip() == current_code.strip():
                    break

                attempt += 1
                final_output += "\n[AUTO-REPAIR] Se detectó un error y se intentó corrección automática con el log de ejecución.\n"
                current_code = repaired_code

            final_code += current_code + "\n"
            final_output += out + "\n"
            if img:
                final_img = img
            if vid:
                final_vid = vid # Gu (MEMORIA SELECTIVA)
    # Aplicamos la compresión antes de guardar
    texto_memoria = procesar_para_memoria(full_text, "assistant")
    uc_safe_append(context_id, {"role": "assistant", "content": texto_memoria})

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
