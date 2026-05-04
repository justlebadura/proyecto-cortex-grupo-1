// -----------------------------------------------------------------------------
// JHAN AI - MATH ASSISTANT: Dark Glass v2.0 (Monochrome Edition)
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import katex from 'katex'
import Latex from 'react-latex-next'
import { addStyles, EditableMathField } from 'react-mathquill'

import LiveLatexInput from './components/LiveLatexInput'
import PresentationPage from './components/PresentationPage'

import { 
  Send, Terminal, Image as ImageIcon, Loader2, PlayCircle, BookOpen, 
  Atom, ChevronRight, ChevronLeft, ChevronDown, Download, X, 
  Settings, Bot, Monitor, Maximize2, Minimize2, Cpu, 
    Sigma, FunctionSquare, MoreHorizontal, Trash2, Search, Type, Brain, Layout, Layers, Activity
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

addStyles()

// --- HERRAMIENTAS MATEMÁTICAS ---
const MATH_TABS = [
  { id: 'common', label: 'Básicos', icon: 'calculator' },
  { id: 'calculus', label: 'Cálculo', icon: 'function-square' },
  { id: 'algebra', label: 'Álgebra', icon: 'variable' },
  { id: 'greek', label: 'Griego', icon: 'sigma' },
  { id: 'logic', label: 'Lógica', icon: 'binary' },
  { id: 'matrix', label: 'Matrices', icon: 'grid' },
]

const MATH_TOOLS = {
  common: [
    { label: 'Fracción', latex: '\\frac{a}{b}', icon: '½' },
    { label: 'Raíz Cuadrada', latex: '\\sqrt{x}', icon: '√' },
    { label: 'Potencia', latex: 'x^n', icon: 'xⁿ' },
    { label: 'Subíndice', latex: 'x_n', icon: 'xₙ' },
    { label: 'Valor Absoluto', latex: '|x|', icon: '|x|' },
    { label: 'Paréntesis', latex: '(x)', icon: '( )' },
    { label: 'Corchetes', latex: '[x]', icon: '[ ]' },
    { label: 'Llaves', latex: '\\{x\\}', icon: '{ }' },
    { label: 'Porcentaje', latex: '\\%', icon: '%' },
    { label: 'Infinito', latex: '\\infty', icon: '∞' },
    { label: 'Por', latex: '\\times', icon: '×' },
    { label: 'División', latex: '\\div', icon: '÷' },
    { label: 'Más/Menos', latex: '\\pm', icon: '±' },
    { label: 'Distinto', latex: '\\neq', icon: '≠' },
    { label: 'Aprox', latex: '\\approx', icon: '≈' },
  ],
  calculus: [
    { label: 'Integral Indef.', latex: '\\int x dx', icon: '∫' },
    { label: 'Integral Def.', latex: '\\int_{a}^{b} x dx', icon: '∫ₐᵇ' },
    { label: 'Integral Doble', latex: '\\iint', icon: '∬' },
    { label: 'Integral Triple', latex: '\\iiint', icon: '∭' },
    { label: 'Integral Cerrada', latex: '\\oint', icon: '∮' },
    { label: 'Derivada', latex: '\\frac{d}{dx}', icon: 'd/dx' },
    { label: 'Derivada Parcial', latex: '\\frac{\\partial}{\\partial x}', icon: '∂/∂x' },
    { label: 'Sumatoria', latex: '\\sum_{i=0}^{n}', icon: 'Σ' },
    { label: 'Producto', latex: '\\prod_{i=0}^{n}', icon: 'Π' },
    { label: 'Límite', latex: '\\lim_{x \\to a}', icon: 'lim' },
    { label: 'Límite Inf.', latex: '\\lim_{x \\to \\infty}', icon: 'lim ∞' },
    { label: 'Nabla', latex: '\\nabla', icon: '∇' },
    { label: 'Laplaciano', latex: '\\Delta', icon: 'Δ' },
  ],
  algebra: [
    { label: 'Igual', latex: '=', icon: '=' },
    { label: 'Existe', latex: '\\exists', icon: '∃' },
    { label: 'Para todo', latex: '\\forall', icon: '∀' },
    { label: 'Pertenencia', latex: '\\in', icon: '∈' },
    { label: 'No pertenece', latex: '\\notin', icon: '∉' },
    { label: 'Conjunto Vacío', latex: '\\emptyset', icon: '∅' },
    { label: 'Unión', latex: '\\cup', icon: '∪' },
    { label: 'Intersección', latex: '\\cap', icon: '∩' },
    { label: 'Subconjunto', latex: '\\subset', icon: '⊂' },
    { label: 'Supraconjunto', latex: '\\supset', icon: '⊃' },
    { label: 'Implica', latex: '\\implies', icon: '⟹' },
    { label: 'Si y solo si', latex: '\\iff', icon: '⟺' },
    { label: 'Por lo tanto', latex: '\\therefore', icon: '∴' },
    { label: 'Raíz N', latex: '\\sqrt[n]{x}', icon: 'ⁿ√' },
  ],
  greek: [
    { label: 'Alpha', latex: '\\alpha', icon: 'α' },
    { label: 'Beta', latex: '\\beta', icon: 'β' },
    { label: 'Gamma', latex: '\\gamma', icon: 'γ' },
    { label: 'Delta', latex: '\\delta', icon: 'δ' },
    { label: 'Epsilon', latex: '\\epsilon', icon: 'ε' },
    { label: 'Zeta', latex: '\\zeta', icon: 'ζ' },
    { label: 'Eta', latex: '\\eta', icon: 'η' },
    { label: 'Theta', latex: '\\theta', icon: 'θ' },
    { label: 'Lambda', latex: '\\lambda', icon: 'λ' },
    { label: 'Mu', latex: '\\mu', icon: 'μ' },
    { label: 'Pi', latex: '\\pi', icon: 'π' },
    { label: 'Rho', latex: '\\rho', icon: 'ρ' },
    { label: 'Sigma', latex: '\\sigma', icon: 'σ' },
    { label: 'Tau', latex: '\\tau', icon: 'τ' },
    { label: 'Phi', latex: '\\phi', icon: 'φ' },
    { label: 'Omega', latex: '\\omega', icon: 'ω' },
    { label: 'Delta May.', latex: '\\Delta', icon: 'Δ' },
    { label: 'Omega May.', latex: '\\Omega', icon: 'Ω' },
  ],
  logic: [
    { label: 'Negación', latex: '\\neg', icon: '¬' },
    { label: 'Y Lógico', latex: '\\land', icon: '∧' },
    { label: 'O Lógico', latex: '\\lor', icon: '∨' },
    { label: 'O Exclusivo', latex: '\\oplus', icon: '⊕' },
    { label: 'Equivalente', latex: '\\equiv', icon: '≡' },
    { label: 'Congruente', latex: '\\cong', icon: '≅' },
    { label: 'Similar', latex: '\\sim', icon: '∼' },
    { label: 'Proporcional', latex: '\\propto', icon: '∝' },
  ],
  matrix: [
    { label: 'Vector 2D', latex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}', icon: '(x,y)' },
    { label: 'Vector 3D', latex: '\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', icon: '(x,y,z)' },
    { label: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', icon: '[2x2]' },
    { label: 'Matriz 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', icon: '[3x3]' },
    { label: 'Determinante', latex: '\\det(A)', icon: '|A|' },
    { label: 'Transpuesta', latex: 'A^T', icon: 'Aᵀ' },
    { label: 'Inversa', latex: 'A^{-1}', icon: 'A⁻¹' },
  ]
}

// --- COMPONENTES UI REUTILIZABLES ---
const Tooltip = ({ text, children }) => (
  <div className="group relative">
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block px-2.5 py-1 text-[10px] font-medium text-white bg-black/90 rounded border border-white/20 whitespace-nowrap backdrop-blur-md shadow-lg transition-opacity duration-200 z-50">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black/90"></div>
    </div>
  </div>
);

const StatusPill = ({ ok, label }) => (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${ok ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' : 'border-red-400/30 text-red-300 bg-red-400/10'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-300' : 'bg-red-300'}`}></span>
        {label}
    </span>
)

// --- MODAL DE AJUSTES ---
const SettingsModal = ({ isOpen, onClose, apiEndpoint, visualizationMode, onVisualizationModeChange, showDevMode, setShowDevMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#050505] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={18}/> Configuración del Sistema</h3>
           <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        
        <div className="space-y-4">
           <div>
              <label className="block text-xs font-mono text-gray-400 mb-3 uppercase">Motor de Renderizado</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                  <button 
                      onClick={() => onVisualizationModeChange('manim')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-all ${visualizationMode === 'manim' ? 'bg-white/10 shadow-lg border border-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                      <PlayCircle size={18} className={visualizationMode === 'manim' ? 'text-purple-400' : ''}/>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Manim</span>
                  </button>

                  <button 
                      onClick={() => onVisualizationModeChange('matplotlib')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-all ${visualizationMode === 'matplotlib' ? 'bg-white/10 shadow-lg border border-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                      <ImageIcon size={18} className={visualizationMode === 'matplotlib' ? 'text-blue-400' : ''}/>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Matplotlib</span>
                  </button>
              </div>
           </div>
           
           <div>
              <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={showDevMode} 
                   onChange={(e) => setShowDevMode(e.target.checked)}
                   className="w-4 h-4 accent-emerald-500 rounded bg-white/10 border-white/20"
                 />
                 <span className="text-xs font-mono text-gray-400 uppercase">Modo Desarrollador (Mostrar estado API y herramientas)</span>
              </label>
           </div>
           
           <div>
              <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Precisión Numérica</label>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                 <input type="range" className="flex-1 accent-white" />
                 <span className="text-xs text-gray-400">float64</span>
              </div>
           </div>

           <div>
              <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Api Endpoint</label>
              <input type="text" value={apiEndpoint} disabled className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-500"/>
           </div>

           <div className="pt-4 border-t border-white/5 flex justify-end">
               <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Guardar Cambios</button>
           </div>
        </div>
      </div>
    </div>
  )
}

const StudyPlanModal = ({ isOpen, onClose, onSubmit }) => {
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#050505] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={18}/> Generar Plan de Estudios</h3>
           <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18}/></button>
        </div>
        
        <div className="space-y-4">
           <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Tema a estudiar (desde cero)</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Integrales, Álgebra Lineal, Ecuaciones Diferenciales..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && topic.trim()) {
                        onSubmit(topic.trim());
                    }
                }}
              />
           </div>
           
           <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
               <p className="text-xs text-indigo-200/70 leading-relaxed">
                   Se creará una <strong>nueva sesión independiente</strong> con una guía estructurada que enseñará el tema desde los fundamentos absolutos, incluyendo fórmulas, métodos completos, ejemplos y ejercicios pre-resueltos paso a paso.
               </p>
           </div>

           <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
               <button onClick={onClose} className="px-4 py-2 bg-transparent hover:bg-white/5 rounded-lg text-sm font-medium text-gray-400 transition-colors">Cancelar</button>
               <button 
                 onClick={() => { if(topic.trim()) onSubmit(topic.trim()); }} 
                 disabled={!topic.trim()}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-500/20"
               >
                   Generar Plan Completo
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- VISUALIZADOR FLOTANTE (Centred Modal) ---
const Visualizer = ({ media, onClose }) => {
  if (!media) return null;
  const { type, data, code } = media;
  const isVideo = type === 'video';
  const isIframe = type === 'iframe';

  const handleDownload = () => {
    if (isIframe) return;
    const link = document.createElement('a');
    link.href = isVideo ? `data:video/mp4;base64,${data}` : `data:image/png;base64,${data}`;
    link.download = isVideo ? 'jhan-ai-animation.mp4' : 'jhan-ai-plot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Container Main */}
      <div className="relative w-full max-w-6xl flex flex-col items-center justify-center">
        
        {/* Controls Bar (Floating Top) */}
        <div className="absolute -top-16 flex items-center gap-4 bg-black/50 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl z-50 transition-transform hover:scale-105">
           
           <div className="flex items-center gap-3 pr-4 border-r border-white/10">
               {isVideo ? <PlayCircle size={20} className="text-white"/> : isIframe ? <Layout size={20} className="text-white"/> : <ImageIcon size={20} className="text-white"/>}
               <span className="text-sm font-bold text-gray-200 tracking-wide uppercase">
                 {isVideo ? 'Manim Animation' : isIframe ? 'Simulador Interactivo' : 'Figure View'}
               </span>
           </div>

           <div className="flex gap-2">
               {!isIframe && (
                 <Tooltip text="Descargar Original">
                    <button onClick={handleDownload} className="p-2 hover:bg-white/20 rounded-full text-white transition-all"><Download size={20}/></button>
                 </Tooltip>
               )}
               <Tooltip text="Cerrar Vista">
                  <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full border border-white/10 transition-all ml-2"><X size={20}/></button>
               </Tooltip>
           </div>
        </div>

        {/* Media Content */}
        <div className="relative w-full h-[80vh] flex items-center justify-center rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] bg-[#050505]">
             {isVideo ? (
                 <VideoPlayer b64data={data} className="w-full h-full object-contain"/>
             ) : isIframe ? (
                 <iframe srcDoc={data} className="w-full h-full bg-white" sandbox="allow-scripts allow-same-origin allow-popups" />
             ) : (
                 <img src={`data:image/png;base64,${data}`} className="w-full h-full object-contain" alt="Visualization" />
             )}
        </div>

        {/* Code Drawer (Optional / Minimized) */}
        {code && !isIframe && (
            <div className="mt-6 w-full max-w-2xl">
                <details className="group">
                    <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest opacity-50 hover:opacity-100">
                        <Terminal size={12}/> View Generated Source <ChevronDown size={12} className="group-open:rotate-180 transition-transform"/>
                    </summary>
                    <div className="mt-4 p-4 rounded-xl bg-black/50 border border-white/10 text-left max-h-40 overflow-auto custom-scrollbar">
                         <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{margin:0, padding:0, background:'transparent', fontSize:'0.75rem'}}>
                            {code}
                         </SyntaxHighlighter>
                    </div>
                </details>
            </div>
        )}

      </div>
    </div>
  );
}

// --- BLOQUE DE CÓDIGO COLAPSABLE ---
const CodeBlock = ({ language = 'text', codeStr, media, onOpenMedia, ...props }) => {
  const safeLang = (language || 'text').toLowerCase();
  const isInternal = ['python', 'manim', 'bash', 'html'].includes(safeLang);
  const isHtml = safeLang === 'html';
  const [isOpen, setIsOpen] = useState(!isInternal);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(codeStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRunHtml = (e) => {
    e.preventDefault();
    onOpenMedia({ type: 'iframe', data: codeStr, code: codeStr });
  };

  const langIconMap = {
    python: <Cpu size={12} className="text-emerald-400"/>,
    manim: <PlayCircle size={12} className="text-purple-400"/>,
    bash: <Terminal size={12} className="text-yellow-400"/>,
    html: <Layout size={12} className="text-blue-400"/>,
  };
  const langIcon = langIconMap[safeLang] || <Terminal size={12} className="text-gray-400"/>;

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-white/[0.08] shadow-xl bg-[#0d0d0d] group/code">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06]">
        <button
          onClick={(e) => { e.preventDefault(); setIsOpen(v => !v); }}
          className="flex items-center gap-2 text-left"
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
          </div>
          <span className="ml-2 flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">
            {langIcon} {language}
          </span>
          <ChevronDown size={11} className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
        </button>
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button onClick={handleCopy}
            className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border transition-all duration-150
              border-white/10 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 active:scale-95"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
          {/* RUN button for Math Media */}
          {media && !isHtml && (
            <button
              onClick={(e) => { e.preventDefault(); onOpenMedia(media); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150
                bg-emerald-500/15 border-emerald-500/40 text-emerald-300
                hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:text-emerald-200
                active:scale-95 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
            >
              <PlayCircle size={11}/> Ver resultado
            </button>
          )}
          {/* RUN button for HTML Simulators */}
          {isHtml && (
             <button
             onClick={handleRunHtml}
             className="flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150
               bg-blue-500/15 border-blue-500/40 text-blue-300
               hover:bg-blue-500/30 hover:border-blue-400/60 hover:text-blue-200
               active:scale-95 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
           >
             <Layout size={11}/> Ver Simulador
           </button>
          )}
        </div>
      </div>
      {/* Code body */}
      {isOpen && (
        <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
          <SyntaxHighlighter
            {...props}
            children={codeStr}
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{ margin: 0, padding: '1.1rem 1.25rem', background: 'transparent', fontSize: '0.82em', lineHeight: '1.7' }}
          />
        </div>
      )}
    </div>
  );
};

// --- VIDEO PLAYER (blob URL para compatibilidad cross-browser) ---
const VideoPlayer = ({ b64data, className }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let currentUrl = null;
    if (!b64data) return;

    try {
      // Usar setTimeout para evitar bloquear el hilo principal (UI freeze)
      const timer = setTimeout(() => {
        try {
          const binaryString = window.atob(b64data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'video/mp4' });
          currentUrl = URL.createObjectURL(blob);
          setBlobUrl(currentUrl);
        } catch (e) {
          console.error("Error decodificando video:", e);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error procesando video:', err);
    }

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [b64data]);

  if (!blobUrl) return (
    <div className={`${className} flex items-center justify-center bg-black/60 rounded-lg`}>
      <Loader2 size={24} className="animate-spin text-white/40"/>
    </div>
  );
  return (
    <video controls loop autoPlay muted playsInline className={className} src={blobUrl} />
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 font-mono text-xs whitespace-pre-wrap">
          Error renderizando mensaje: {this.state.error?.message}
          {'\n\nTexto original:\n' + this.props.fallbackText}
        </div>
      );
    }
    return this.props.children;
  }
}

// --- MENSAJES ---
const AnimatedMarkdown = ({ content, media, onOpenMedia }) => {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let i = 0;
    const charsPerTick = Math.max(1, Math.floor(content.length / 60)); 
    
    const timer = setInterval(() => {
      i += charsPerTick;
      if (i >= content.length) {
        setDisplayedContent(content);
        clearInterval(timer);
      } else {
        setDisplayedContent(content.substring(0, i));
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [content]);

  return (
    <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-8 text-gray-100 tracking-tight" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-12 mb-6 text-gray-100 tracking-tight border-b border-white/10 pb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-8 mb-4 text-gray-100 tracking-tight text-emerald-400/90" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-base font-bold mt-6 mb-3 text-gray-300 tracking-tight" {...props} />,
            code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const contentStr = String(children).replace(/\n$/, '')
                const isPythonLike = contentStr.includes('def ') || contentStr.includes('import ') || contentStr.includes('class ') || contentStr.includes('print(')
                const language = match ? match[1] : (isPythonLike ? 'python' : 'text')
                
                return !inline ? (
                   <CodeBlock language={language} codeStr={contentStr} media={media} onOpenMedia={onOpenMedia} {...props} />
                ) : (
                   <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-white/5" {...props}>{children}</code>
                )
            }
        }} 
    >
      {displayedContent}
    </ReactMarkdown>
  );
};

const Message = ({ role, content, media, onOpenMedia, isNew }) => {
  const isUser = role === 'user';

  // Procesar saltos de linea y corregir delimitadores de LaTeX rotos para evitar errores de renderizado
  const formattedContent = useMemo(() => {
    if (!content) return '';
    return content
      // Corregir delimitadores de LaTeX
      .replace(/\\\[/g, () => '$$')
      .replace(/\\\]/g, () => '$$')
      .replace(/\\\(/g, () => '$')
      .replace(/\\\)/g, () => '$')
      // Asegurar lineas en blanco alrededor de las reglas horizontales
      .replace(/\n*(---\n*)+/g, '\n\n---\n\n')
      // Asegurar espacio DESPUÉS de los #
      .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
      // Asegurar espacio ANTES de los títulos si no lo hay (para que markdown los detecte)
      .replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2')
      // Asegurar espacio después de los títulos (para separar del siguiente párrafo)
      .replace(/(#{1,6}\s+[^\n]+)\n([^\n])/g, '$1\n\n$2')
      // Evitar saltos de linea gigantescos
      .replace(/\n{4,}/g, '\n\n');
  }, [content]);

  return (
    <div className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
       <div className={`
          relative rounded-[24px] border backdrop-blur-[15px] transition-all duration-300
          ${isUser 
             ? 'max-w-[80%] lg:max-w-[70%] p-4 px-5 bg-white/10 text-white rounded-br-sm border-white/10 hover:border-white/20 shadow-[0_2px_20px_rgba(0,0,0,0.2)]' 
             : 'w-full max-w-full p-7 bg-white/[0.03] text-gray-200 rounded-bl-sm border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.15)]'}
       `}>
          {/* Avatar Name for AI */}
          {!isUser && (
             <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
               <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                 <Bot size={14} className="text-emerald-400"/>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-emerald-400/90 tracking-wide">Jhan AI</span>
                 <span className="text-[10px] text-gray-600 font-mono">v2.0</span>
               </div>
             </div>
          )}

          {/* Markdown Content */}
          <div className={`prose prose-base prose-invert max-w-none whitespace-pre-wrap
            [&_.katex]:text-white [&_.katex-display]:my-8 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-5 [&_.katex-display]:px-6 [&_.katex-display]:bg-white/[0.03] [&_.katex-display]:rounded-2xl [&_.katex-display]:border [&_.katex-display]:border-white/10
            prose-p:leading-loose prose-p:mb-8 prose-p:text-gray-200 prose-p:text-[15px]
            prose-headings:text-gray-100 prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h1:mt-4 prose-h1:mb-8
            prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
            prose-h4:text-base prose-h4:mt-6 prose-h4:mb-3 prose-h4:text-gray-300
            prose-ul:my-6 prose-ul:pl-6 prose-ol:my-6 prose-ol:pl-6
            prose-li:my-4 prose-li:leading-loose prose-li:text-gray-200 prose-li:text-[15px]
            prose-code:text-emerald-300 prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[0.88em]
            prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/50 prose-pre:mb-8 prose-pre:mt-6 prose-pre:rounded-2xl
            prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-emerald-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-5 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
            prose-hr:border-transparent prose-hr:border-b prose-hr:border-b-white/15 prose-hr:my-12
          `}>
             <ErrorBoundary fallbackText={formattedContent}>
               {isNew && !isUser ? (
                 <AnimatedMarkdown content={formattedContent} media={media} onOpenMedia={onOpenMedia} />
               ) : (
                 <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                    components={{
                        code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            const contentStr = String(children).replace(/\n$/, '')
                            const isPythonLike = contentStr.includes('def ') || contentStr.includes('import ') || contentStr.includes('class ') || contentStr.includes('print(')
                            const language = match ? match[1] : (isPythonLike ? 'python' : 'text')
                            
                            return !inline ? (
                               <CodeBlock language={language} codeStr={contentStr} media={media} onOpenMedia={onOpenMedia} {...props} />
                            ) : (
                               <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-white/5" {...props}>{children}</code>
                            )
                        }
                    }} 
                 >{formattedContent}</ReactMarkdown>
               )}
             </ErrorBoundary>
          </div>

          {/* Inline Media Player */}
          {!isUser && media && (
              <div className="mt-6 w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] shadow-2xl">
                 <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                         <div className={`w-6 h-6 rounded-md flex items-center justify-center ${media.type === 'video' ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-blue-500/15 border border-blue-500/30'}`}>
                           {media.type === 'video' ? <PlayCircle size={12} className="text-purple-400"/> : <ImageIcon size={12} className="text-blue-400"/>}
                         </div>
                         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{media.type === 'video' ? 'Animación Manim' : 'Gráfica'}</span>
                    </div>
                    <div className="flex gap-1.5">
                         <button onClick={() => {
                             const link = document.createElement('a');
                             link.href = media.type === 'video' ? `data:video/mp4;base64,${media.data}` : `data:image/png;base64,${media.data}`;
                             link.download = media.type === 'video' ? 'jhan-ai.mp4' : 'jhan-ai.png';
                             link.click();
                         }} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-white/10 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all active:scale-95">
                           <Download size={10}/> Descargar
                         </button>
                         <button onClick={() => onOpenMedia(media)} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-white/10 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all active:scale-95">
                           <Maximize2 size={10}/> Ampliar
                         </button>
                    </div>
                 </div>
                 
                 <div className="relative w-full flex items-center justify-center p-4 bg-[url('/grid.svg')] bg-center">
                     {media.type === 'video' ? (
                         <VideoPlayer b64data={media.data} className="w-full max-h-[500px] object-contain rounded-lg shadow-lg"/>
                     ) : (
                         <img src={`data:image/png;base64,${media.data}`} className="w-full max-h-[500px] object-contain rounded-lg shadow-lg" alt="Chart" />
                     )}
                 </div>
              </div>
          )}
       </div>
    </div>
  );
}

// --- MAIN APP ---
function App() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const [sessions, setSessions] = useState([{id: 1, title: 'Sesión Principal', date: new Date()}])
  const [currentSessionId, setCurrentSessionId] = useState(1)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editingSessionTitle, setEditingSessionTitle] = useState('')
  const [sessionMessages, setSessionMessages] = useState({ 1: [] })
  const messages = sessionMessages[currentSessionId] || [];
  
  const setMessages = (updaterOrValue, specificSessionId = null) => {
      setSessionMessages(prev => {
          const targetId = specificSessionId !== null ? specificSessionId : currentSessionId;
          const prevMsgs = prev[targetId] || [];
          const newMsgs = typeof updaterOrValue === 'function' ? updaterOrValue(prevMsgs) : updaterOrValue;
          return { ...prev, [targetId]: newMsgs };
      });
  };

  const [input, setInput] = useState('')
  const [visualData, setVisualData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false)
  const [activeMathTab, setActiveMathTab] = useState('common')
  const [showToolbox, setShowToolbox] = useState(false)
  const [toolboxSearch, setToolboxSearch] = useState('')
    const [activeView, setActiveView] = useState('chat')
    const [isPresenting, setIsPresenting] = useState(false)
    const [visualizationMode, setVisualizationMode] = useState(() => localStorage.getItem('jhan-visualization-mode') || 'manim')
    const [showDevMode, setShowDevMode] = useState(() => localStorage.getItem('jhan-dev-mode') === 'true')
    const [showInlineMathEditor, setShowInlineMathEditor] = useState(false)
    const [inlineMathLatex, setInlineMathLatex] = useState('')
    const [pendingMathBlocks, setPendingMathBlocks] = useState([])
    const latexRuntimeReady = useMemo(() => {
        try {
            katex.renderToString('x^2 + y^2')
            return true
        } catch {
            return false
        }
    }, [])
    const [systemStatus, setSystemStatus] = useState({
        apiOnline: false,
        llmReady: false,
        manimReady: false,
        latexReady: latexRuntimeReady,
        ultracontextReady: false,
    })
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
    const mathFieldRef = useRef(null)

  // Filtrado de herramientas
  const filteredTools = useMemo(() => {
    if (!toolboxSearch.trim()) {
      return MATH_TOOLS[activeMathTab] || [];
    }
    // Si hay búsqueda, busca en TODAS las categorías
    const allTools = Object.values(MATH_TOOLS).flat();
    return allTools.filter(t => t.label.toLowerCase().includes(toolboxSearch.toLowerCase()));
  }, [activeMathTab, toolboxSearch]);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

    useEffect(() => {
        localStorage.setItem('jhan-visualization-mode', visualizationMode)
    }, [visualizationMode])

    useEffect(() => {
        localStorage.setItem('jhan-dev-mode', showDevMode)
    }, [showDevMode])

    useEffect(() => {
        if (showInlineMathEditor) {
            setShowToolbox(true)
            setTimeout(() => mathFieldRef.current?.focus(), 0)
        }
    }, [showInlineMathEditor])

    useEffect(() => {
        let isMounted = true

        const checkSystem = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/health`, { timeout: 4000 })
                if (!isMounted) return
                setSystemStatus({
                    apiOnline: Boolean(data?.ok),
                    llmReady: Boolean(data?.llm_ready),
                    manimReady: Boolean(data?.manim_installed),
                    latexReady: latexRuntimeReady,
                    ultracontextReady: Boolean(data?.ultracontext_ready),
                })
            } catch {
                if (!isMounted) return
                setSystemStatus(prev => ({
                    ...prev,
                    apiOnline: false,
                    llmReady: false,
                    manimReady: false,
                    latexReady: latexRuntimeReady,
                    ultracontextReady: false,
                }))
            }
        }

        checkSystem()
        const intervalId = setInterval(checkSystem, 10000)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [API_BASE_URL, latexRuntimeReady])

    const handleSubmit = async (e, directText = null) => {
        if (e) e.preventDefault()
        if (loading) return

        const queuedMath = [...pendingMathBlocks]
        if (showInlineMathEditor && inlineMathLatex.trim()) {
            queuedMath.push({ id: Date.now(), latex: inlineMathLatex.trim() })
        }

        let userText = ""
        
        if (directText) {
            userText = directText
        } else {
            const plainText = input.trim()
            if (!plainText && queuedMath.length === 0) return

            userText = [
                plainText,
                ...queuedMath.map(block => `$${block.latex}$`),
            ].filter(Boolean).join('\n')
        }

        setInput('')
        setLoading(true)
        setShowToolbox(false)
        setShowInlineMathEditor(false)
        setInlineMathLatex('')
        setPendingMathBlocks([])
        setMessages(p => [...p, { role: 'user', content: userText }])

        try {
            const { data } = await axios.post(`${API_BASE_URL}/chat`, {
                message: userText,
                context_id: `jhan-session-${currentSessionId}`,
                visualization_mode: visualizationMode
            })

            let newMedia = null
            if (data.video_base64) newMedia = { type: 'video', data: data.video_base64, code: data.code_executed }
            else if (data.image_base64) newMedia = { type: 'image', data: data.image_base64, code: data.code_executed }
          
            setMessages(p => p.map(m => ({...m, isNew: false})).concat([{ role: 'assistant', content: data.response, media: newMedia, isNew: true }]))
        } catch (err) {
            setMessages(p => p.map(m => ({...m, isNew: false})).concat([{ role: 'assistant', content: `**System Error:** ${err.message}`, isNew: true }]))
            setSystemStatus(prev => ({ ...prev, apiOnline: false }))
        }
        setLoading(false)
    }

  const createNewSession = () => {
     const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
     setSessions([...sessions, {id: newId, title: `Sesión ${newId}`, date: new Date()}]);
     setCurrentSessionId(newId);
     setActiveView('chat');
     setIsPresenting(false);
     setMessages([], newId);
     setVisualData(null);
  }

  const startEditingSession = (e, session) => {
     e.stopPropagation();
     setEditingSessionId(session.id);
     setEditingSessionTitle(session.title);
  };

  const saveEditingSession = () => {
     if (editingSessionId) {
        setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, title: editingSessionTitle } : s));
        setEditingSessionId(null);
     }
  };

  const deleteSession = (e, sessionId) => {
     e.stopPropagation();
     if (sessions.length <= 1) {
         alert("No puedes borrar la única sesión.");
         return;
     }
     const newSessions = sessions.filter(s => s.id !== sessionId);
     setSessions(newSessions);
     if (currentSessionId === sessionId) {
         setCurrentSessionId(newSessions[0].id);
         setActiveView('chat');
         setIsPresenting(false);
         setVisualData(null);
     }
     // Also clear from sessionMessages to save memory
     setSessionMessages(prev => {
         const newDict = { ...prev };
         delete newDict[sessionId];
         return newDict;
     });
  };

    const insertLatex = (latex) => {
        if (mathFieldRef.current) {
            mathFieldRef.current.write(latex)
            mathFieldRef.current.focus()
            return
        }

        setInlineMathLatex(prev => prev + latex)
    }

    const handleInputChange = (nextValue) => {
        setInput(nextValue)
        const slashMathRegex = /(^|\s)\/math\s*$/i
        if (slashMathRegex.test(nextValue)) {
            const cleaned = nextValue.replace(slashMathRegex, '')
            setInput(cleaned)
            setShowInlineMathEditor(true)
            setInlineMathLatex('')
        } else if (nextValue === '') {
            setShowInlineMathEditor(false)
            setShowToolbox(false)
            setInlineMathLatex('')
        }
    }

    const finishInlineMath = () => {
        const cleanMath = inlineMathLatex.trim()
        if (cleanMath) {
            setPendingMathBlocks(prev => ([
                ...prev,
                { id: Date.now(), latex: cleanMath },
            ]))
        }
        setShowInlineMathEditor(false)
        setShowToolbox(false)
        setInlineMathLatex('')
        inputRef.current?.focus()
    }

    const removeMathBlock = (id) => {
        setPendingMathBlocks(prev => prev.filter(block => block.id !== id))
    }

  // --- UI RENDER ---

  return (
    <div className="w-screen h-screen bg-[#000] text-gray-200 overflow-hidden font-sans selection:bg-white/20 selection:text-white flex flex-row relative z-0">
         
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                apiEndpoint={API_BASE_URL}
                visualizationMode={visualizationMode}
                onVisualizationModeChange={setVisualizationMode}
                showDevMode={showDevMode}
                setShowDevMode={setShowDevMode}
            />

            <StudyPlanModal
                isOpen={isStudyPlanOpen}
                onClose={() => setIsStudyPlanOpen(false)}
                onSubmit={(topic) => {
                    setIsStudyPlanOpen(false);
                    // Crear sesión nueva independiente para el plan de estudios
                const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
                const sessionTitle = `Plan: ${topic}`;
                // Update session state inside the setter for accurate lengths if needed, but we rely on current length here
                setSessions(prev => [...prev, {id: newId, title: sessionTitle, date: new Date()}]);
                setCurrentSessionId(newId);
                setActiveView('chat');
                setIsPresenting(false);
                setMessages([], newId);
                setVisualData(null);
                
                // Enviar el prompt estructurado
                const planPrompt = `Genera un PLAN DE ESTUDIOS COMPLETO y DESDE CERO sobre el tema: "${topic}". \n\nEste plan debe ser una guía autónoma independiente del chat habitual. \nDebes incluir OBLIGATORIAMENTE lo siguiente:\n1. Explicación teórica desde los fundamentos absolutos.\n2. Todas las fórmulas esenciales, deducciones rápidas y cómo utilizarlas para calcular en casos prácticos.\n3. Todos los métodos de resolución aplicables (por ejemplo, si el tema es integrales, incluye sustitución, integración por partes, fracciones parciales, etc.).\n4. Ejemplos detallados paso a paso para cada fórmula y método de resolución.\n5. Una sección robusta de ejercicios PRE-RESUELTOS paso a paso para que el estudiante practique (aclara explícitamente en el texto que estos son "Casos de ejemplo prácticos pre-resueltos para consolidar el aprendizaje").\n\nNo omitas métodos ni escatimes en explicaciones numéricas. Actúa como el Catedrático dictando un curso intensivo completo.`;
                
                // Llamamos directamente a un submit especial que ignora el state actual y envía a la nueva sesión
                const submitForNewSession = async () => {
                    setLoading(true);
                    setMessages([{ role: 'user', content: planPrompt }], newId);
                    try {
                        const { data } = await axios.post(`${API_BASE_URL}/chat`, {
                            message: planPrompt,
                            context_id: `jhan-session-${newId}`,
                            visualization_mode: visualizationMode
                        });
            
                        let newMedia = null;
                        if (data.video_base64) newMedia = { type: 'video', data: data.video_base64, code: data.code_executed };
                        else if (data.image_base64) newMedia = { type: 'image', data: data.image_base64, code: data.code_executed };
                      
                        const finalMessages = [{ role: 'user', content: planPrompt }, { role: 'assistant', content: data.response, media: newMedia }];
                        
                        setMessages([...finalMessages.map(m => ({...m, isNew: m.role === 'assistant'}))], newId);
                        
                        // Auto-export the generated study plan to LaTeX
                        setTimeout(async () => {
                            try {
                                const response = await axios.post(`${API_BASE_URL}/export_latex`, { messages: finalMessages }, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                link.setAttribute('download', `Plan_Estudio_${safeTopic}.zip`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch(e) {
                                console.error("Error auto-exporting study plan:", e);
                            }
                        }, 1000);
                        
                    } catch (err) {
                        setMessages([{ role: 'user', content: planPrompt }, { role: 'assistant', content: `**System Error:** ${err.message}`, isNew: true }], newId);
                        setSystemStatus(prev => ({ ...prev, apiOnline: false }));
                    }
                    setLoading(false);
                };
                
                submitForNewSession();
            }}
            />

         {/* DARK BACKGROUND LAYER */}
         <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
             <div className="liquid-bg"></div>
         </div>

        {/* SIDEBAR - DARK GLASS */}
        <nav className={`relative z-20 flex flex-col liquid-glass-strong border-r border-white/5 transition-all duration-500 ease-in-out h-full shrink-0 ${isPresenting ? 'w-0 overflow-hidden border-none opacity-0 pointer-events-none' : (sidebarOpen ? 'w-72' : 'w-[70px]')}`}>
             
             {/* Logo Area */}
             <div className="h-20 flex items-center justify-center border-b border-white/5 shrink-0 bg-black/20">
                 <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 w-0'}`}>
                     <div className="p-2 rounded-xl bg-white/10 shadow-lg shadow-white/5"><Atom size={24} className="text-white"/></div>
                     <span className="font-bold text-xl tracking-tighter text-white">JHAN AI</span>
                 </div>
                 {!sidebarOpen && <div className="p-2 animate-pulse"><Atom size={24} className="text-white"/></div>}
             </div>

             {/* Nav Items */}
             <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                 <Tooltip text="Nueva Sesión">
                    <button onClick={createNewSession} className={`w-full p-3 rounded-xl flex items-center gap-4 ${sidebarOpen ? 'justify-start' : 'justify-center'} bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group mb-4`}>
                        <BookOpen size={20} className=""/>
                        {sidebarOpen && <span className="text-sm font-medium">New Session</span>}
                    </button>
                 </Tooltip>
                 
                 {sidebarOpen && <div className="px-2 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">History</div>}
                 
                 {sessions.map(s => (
                    <div key={s.id} className="relative group">
                        <button 
                            onClick={() => {
                                setCurrentSessionId(s.id);
                                setActiveView('chat');
                                setIsPresenting(false);
                            }}
                            className={`w-full p-3 rounded-xl flex items-center gap-4 ${sidebarOpen ? 'justify-start' : 'justify-center'} ${currentSessionId === s.id ? 'bg-white/20 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'} transition-all group/btn border border-transparent`}
                        >
                            <MoreHorizontal size={20} className="group-hover/btn:text-white transition-colors flex-shrink-0"/>
                            {sidebarOpen && <div className="text-left w-full overflow-hidden flex-1">
                                {editingSessionId === s.id ? (
                                    <input 
                                        autoFocus
                                        value={editingSessionTitle}
                                        onChange={(e) => setEditingSessionTitle(e.target.value)}
                                        onBlur={saveEditingSession}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditingSession();
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-black/50 border border-emerald-500/50 rounded px-1.5 py-0.5 text-sm text-white outline-none focus:border-emerald-400"
                                    />
                                ) : (
                                    <div className="text-sm font-medium truncate pr-6">{s.title}</div>
                                )}
                                <div className="text-[10px] text-gray-500">{s.date.toLocaleTimeString()}</div>
                            </div>}
                        </button>
                        {sidebarOpen && editingSessionId !== s.id && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => startEditingSession(e, s)}
                                    className="p-1.5 rounded-lg bg-black/40 text-gray-400 hover:text-white hover:bg-white/20 border border-white/10"
                                    title="Renombrar Sesión"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                {sessions.length > 1 && (
                                    <button
                                        onClick={(e) => deleteSession(e, s.id)}
                                        className="p-1.5 rounded-lg bg-black/40 text-red-400 hover:text-white hover:bg-red-500/80 border border-red-500/20"
                                        title="Borrar Sesión"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                 ))}
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t border-white/5 shrink-0">
                 <Tooltip text="Presentacion del sistema">
                    <button
                        onClick={() => setActiveView('presentacion')}
                        className={`w-full mb-2 p-3 rounded-xl flex items-center gap-4 ${sidebarOpen ? 'justify-start' : 'justify-center'} transition-all border ${activeView === 'presentacion' ? 'bg-white/15 border-white/20 text-white' : 'bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Monitor size={20} />
                        {sidebarOpen && <span className="text-sm font-medium">Presentacion</span>}
                    </button>
                 </Tooltip>
                 <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full p-2 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                     {sidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                 </button>
             </div>
        </nav>

        {/* MAIN WORKSPACE - MONOCHROME */}
        <main className="flex-1 flex flex-col relative z-10 transition-all duration-300 h-full overflow-hidden backdrop-blur-[2px]">
            
            {/* Top Bar - DARK */}
            <header className={`h-16 px-8 flex items-center justify-between border-b border-white/[0.05] liquid-glass sticky top-0 shrink-0 ${isPresenting ? 'hidden' : ''}`}>
                <div className="flex items-center gap-4">
                    {showDevMode && (
                        <>
                            <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${systemStatus.apiOnline ? 'text-emerald-300' : 'text-red-300'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.apiOnline ? 'bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.9)]' : 'bg-red-300 shadow-[0_0_10px_rgba(248,113,113,0.8)]'}`}></span>
                                {systemStatus.apiOnline ? 'API Online' : 'API Offline'}
                            </span>
                            <div className="h-4 w-px bg-white/10"></div>
                            <span className="text-xs text-gray-600 font-mono">Session ID: {currentSessionId}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-1 items-center">
                    <Tooltip text="Generar Plan de Estudios (Guía Autonoma)">
                       <button onClick={() => setIsStudyPlanOpen(true)} className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-white transition-colors border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                           <BookOpen size={14}/>
                           Plan de Estudio
                       </button>
                    </Tooltip>
                    
                    <Tooltip text="Exportar Conversación (LaTeX/PDF)">
                       <button onClick={async () => {
                           try {
                               const response = await axios.post(`${API_BASE_URL}/export_latex`, { messages }, { responseType: 'blob' });
                               const url = window.URL.createObjectURL(new Blob([response.data]));
                               const link = document.createElement('a');
                               link.href = url;
                               link.setAttribute('download', 'export_jhan_ai.zip');
                               document.body.appendChild(link);
                               link.click();
                               link.remove();
                           } catch(e) {
                               console.error("Error exporting:", e);
                               alert("Error al exportar la conversación.");
                           }
                       }} className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-white transition-colors border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                           <Download size={14}/>
                           Exportar LaTeX
                       </button>
                    </Tooltip>

                    {activeView === 'presentacion' && (
                        <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mr-2">Presentacion</span>
                    )}
                    <Tooltip text="Settings"><button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/5 rounded-lg hover:text-white text-gray-500 transition-colors"><Settings size={18}/></button></Tooltip>
                    <div className="w-px h-4 bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">U</span>
                    </div>
                </div>
            </header>

            {/* Split View Content */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                {activeView === 'presentacion' ? (
                    <div className="flex-1 min-w-0 h-full">
                        <PresentationPage isPresenting={isPresenting} setIsPresenting={setIsPresenting} />
                    </div>
                ) : (
                <>
                {/* Chat Column */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-20 animate-fade-in custom-scrollbar flex flex-col">
                        
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in pb-12">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl mb-6 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Brain size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tighter mb-2">JHAN AI <span className="text-emerald-400">v4.1</span></h2>
                                <p className="text-gray-400 text-sm max-w-sm mb-10 leading-relaxed">Catedrático de Matemáticas Avanzadas. Selecciona una opción para comenzar o escribe tu propia consulta.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                                    {[
                                        { title: 'Simulación Interactiva', desc: 'Crea un simulador interactivo para la caída libre', icon: <Layout size={18}/> },
                                        { title: 'Cálculo Avanzado', desc: 'Enséñame integrales desde cero', icon: <BookOpen size={18}/> },
                                        { title: 'Álgebra Lineal', desc: 'Explícame la multiplicación de matrices', icon: <Layers size={18}/> },
                                        { title: 'Demostración', desc: 'Demuestra la regla de la cadena paso a paso', icon: <Activity size={18}/> },
                                    ].map((card, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => {
                                                setInput(card.desc);
                                                inputRef.current?.focus();
                                            }}
                                            className="flex flex-col items-start p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all text-left group shadow-lg"
                                        >
                                            <div className="flex items-center gap-3 mb-3 text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                                                {card.icon}
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{card.title}</span>
                                            </div>
                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{card.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto space-y-6 pb-4 w-full">
                                {messages.map((m, i) => (
                                    <Message key={i} {...m} onOpenMedia={setVisualData} />
                                ))}
                                {loading && (
                                    <div className="flex items-center gap-3 text-gray-500 text-sm p-4 animate-pulse">
                                        <Loader2 className="animate-spin text-white" size={18}/>
                                        <span className="font-mono text-xs uppercase tracking-wider">Processing Logic...</span>
                                    </div>
                                )}
                                <div ref={scrollRef}/>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 lg:px-20 pb-8 shrink-0 z-20 flex flex-col gap-4">
                        
                        <div className="max-w-4xl mx-auto relative group w-full"> 
                             {/* Removed hover events for Toolbox */}
                             
                            {/* MATH TOOLBOX */}
                            <div className={`
                                absolute bottom-full left-0 mb-3 w-full bg-[#050505] rounded-2xl border border-white/20 
                                transition-all duration-300 transform origin-bottom z-50 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col
                                ${showToolbox ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible' : 'opacity-0 translate-y-4 scale-95 pointer-events-none invisible'}
                            `}
                            style={{ height: '400px', maxHeight: '60vh' }}
                            >
                                {/* Search & Tabs Header */}
                                <div className="flex flex-col border-b border-white/10 bg-[#0a0a0a] shrink-0">
                                    {/* Search Bar */}
                                    <div className="p-3 border-b border-white/5 relative">
                                        <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500"/>
                                        <input 
                                            type="text" 
                                            placeholder="Buscar símbolo..." 
                                            value={toolboxSearch}
                                            onChange={(e) => setToolboxSearch(e.target.value)}
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-gray-300 focus:border-white/30 outline-none transition-colors placeholder:text-gray-600"
                                        />
                                        {toolboxSearch && (
                                            <button 
                                                onClick={() => setToolboxSearch('')}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                <X size={14}/>
                                            </button>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    {!toolboxSearch && (
                                        <div className="flex items-center gap-1 p-2 overflow-x-auto custom-scrollbar">
                                            {MATH_TABS.map(tab => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setActiveMathTab(tab.id); }}
                                                    className={`
                                                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                                        ${activeMathTab === tab.id 
                                                            ? 'bg-white/20 text-white border border-white/20' 
                                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}
                                                    `}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tools Grid */}
                                <div className="p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-y-auto custom-scrollbar flex-1 min-h-0"
                                     onWheel={(e) => e.stopPropagation()} 
                                     > 
                                    
                                    {filteredTools.length > 0 ? (
                                        filteredTools.map((tool, i) => (
                                            <button 
                                                key={i}
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); insertLatex(tool.latex); }}
                                                className="w-full aspect-square flex flex-col items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95 border border-white/5 hover:border-white/20 group/btn text-center shadow-lg"
                                            >
                                                <span className="text-xl font-serif italic mb-1.5">{tool.icon}</span>
                                                <span className="text-[10px] text-gray-500 group-hover/btn:text-white/90 truncate w-full px-1">{tool.label}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-3">
                                            <Search size={32} className="opacity-20"/>
                                            <span>No se encontraron símbolos para "<span className="text-gray-300">{toolboxSearch}</span>"</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {pendingMathBlocks.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {pendingMathBlocks.map(block => (
                                        <div key={block.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-100">
                                            <Latex>{`$${block.latex}$`}</Latex>
                                            <button
                                                type="button"
                                                onClick={() => removeMathBlock(block.id)}
                                                className="text-emerald-300/80 hover:text-white"
                                                aria-label="Eliminar bloque matemático"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* The input container */}
                            <div className={`overflow-hidden transition-all duration-300 ease-out ${showInlineMathEditor ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none' : 'max-h-40 opacity-100 translate-y-0'}`}>
                                <form onSubmit={(e) => { e.preventDefault(); if(!loading) handleSubmit(e); }} 
                                    className="relative flex items-center rounded-[2rem] p-2 border border-white/[0.1] transition-all duration-300 bg-transparent active:scale-[0.995] focus-within:border-white/30 z-20">

                                {/* Input Editor */}
                                <div className="w-full px-4 py-3 cursor-text rounded-xl hover:bg-white/[0.02] transition-colors" onClick={() => {
                                    inputRef.current?.focus();
                                }}>
                                    <LiveLatexInput
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Escribe texto... usa /math para abrir el editor matemático"
                                        inputClassName="text-lg text-white font-sans"
                                        autoFocus={true}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pr-2 ml-auto">
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className={`p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${loading ? 'bg-white/5 text-gray-600' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-105 active:scale-95'}`}
                                    >
                                        <Send size={18} className={loading ? 'opacity-50' : ''}/>
                                    </button>
                                </div>
                            </form>
                            </div>

                            {showInlineMathEditor && (
                                <div className="mt-2 p-3 rounded-xl border border-emerald-400/20 bg-emerald-500/5">
                                    <div className="mathquill-editor rounded-lg bg-black/30 border border-emerald-400/20 px-4 py-3 text-emerald-100">
                                        <EditableMathField
                                            latex={inlineMathLatex}
                                            mathquillDidMount={(mathField) => {
                                                mathFieldRef.current = mathField
                                                mathField.focus()
                                            }}
                                            onChange={(mathField) => setInlineMathLatex(mathField.latex())}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') {
                                                    e.preventDefault()
                                                    setShowInlineMathEditor(false)
                                                    setShowToolbox(false)
                                                    setInlineMathLatex('')
                                                    inputRef.current?.focus()
                                                }
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    finishInlineMath()
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowInlineMathEditor(false)
                                                setShowToolbox(false)
                                                setInlineMathLatex('')
                                                inputRef.current?.focus()
                                            }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/15 text-gray-300 hover:bg-white/10"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={finishInlineMath}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-300/30 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20"
                                        >
                                            Insertar
                                        </button>
                                    </div>
                                </div>
                            )}
                            {showDevMode && (
                                <div className="text-center mt-3 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] opacity-40 flex justify-center gap-4">
                                    <StatusPill ok={systemStatus.apiOnline} label="API" />
                                    <StatusPill ok={systemStatus.llmReady} label="Modelo HF" />
                                    <StatusPill ok={systemStatus.latexReady} label="LaTeX" />
                                    <StatusPill ok={systemStatus.manimReady} label="Manim" />
                                    <StatusPill ok={systemStatus.ultracontextReady} label="Memoria" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visualizer Modal */}
                {visualData && (
                    <Visualizer 
                        media={visualData} 
                        onClose={() => setVisualData(null)} 
                    />
                )}
                </>
                )}
            </div>
        </main>
    </div>
  )
}

export default App
