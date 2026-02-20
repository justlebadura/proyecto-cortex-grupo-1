// -----------------------------------------------------------------------------
// CORTEX - MATH AI: Dark Glass v2.0 (Monochrome Edition)
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'

import LiveLatexInput from './components/LiveLatexInput'

import { 
  Send, Terminal, Image as ImageIcon, Loader2, PlayCircle, BookOpen, 
  Atom, ChevronRight, ChevronLeft, ChevronDown, Download, X, 
  Settings, Bot, Monitor, Maximize2, Minimize2, Cpu, 
  Calculator, Sigma, FunctionSquare, MoreHorizontal, Trash2, Search, Type
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

// --- MODAL DE AJUSTES ---
const SettingsModal = ({ isOpen, onClose }) => {
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
              <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Motor de Renderizado</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-200 outline-none focus:border-white/30">
                  <option>Manim (Video)</option>
                  <option>Matplotlib (Estático)</option>
                  <option>ASCII Plot (Terminal)</option>
              </select>
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
              <input type="text" value="http://localhost:8000" disabled className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-500"/>
           </div>

           <div className="pt-4 border-t border-white/5 flex justify-end">
               <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Guardar Cambios</button>
           </div>
        </div>
      </div>
    </div>
  )
}

// --- VISUALIZADOR FLOTANTE (Centred Modal) ---
const Visualizer = ({ media, onClose }) => {
  if (!media) return null;
  const { type, data, code } = media;
  const isVideo = type === 'video';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = isVideo ? `data:video/mp4;base64,${data}` : `data:image/png;base64,${data}`;
    link.download = isVideo ? 'cortex-animation.mp4' : 'cortex-plot.png';
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
               {isVideo ? <PlayCircle size={20} className="text-white"/> : <ImageIcon size={20} className="text-white"/>}
               <span className="text-sm font-bold text-gray-200 tracking-wide uppercase">{isVideo ? 'Manim Animation' : 'Figure View'}</span>
           </div>

           <div className="flex gap-2">
               <Tooltip text="Descargar Original">
                  <button onClick={handleDownload} className="p-2 hover:bg-white/20 rounded-full text-white transition-all"><Download size={20}/></button>
               </Tooltip>
               <Tooltip text="Cerrar Vista">
                  <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full border border-white/10 transition-all ml-2"><X size={20}/></button>
               </Tooltip>
           </div>
        </div>

        {/* Media Content */}
        <div className="relative w-full h-[80vh] flex items-center justify-center rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] bg-[#050505]">
             {isVideo ? (
                 <video controls autoPlay loop className="w-full h-full object-contain">
                     <source src={`data:video/mp4;base64,${data}`} type="video/mp4"/>
                 </video>
             ) : (
                 <img src={`data:image/png;base64,${data}`} className="w-full h-full object-contain" alt="Visualization" />
             )}
        </div>

        {/* Code Drawer (Optional / Minimized) */}
        {code && (
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
const CodeBlock = ({ language, codeStr, media, onOpenMedia, ...props }) => {
  const isInternal = ['python', 'manim', 'bash'].includes(language.toLowerCase());
  const [isOpen, setIsOpen] = useState(!isInternal);

  return (
    <details className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[#050505] group/code transition-all duration-300" open={isOpen} onToggle={(e) => setIsOpen(e.target.open)}>
      <summary className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors list-none select-none">
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1.5 font-bold tracking-wider">
                  {isInternal ? <Cpu size={12} className="text-white"/> : <Terminal size={12} className="text-gray-400"/>}
                  {language} Source
              </span>
              <ChevronDown size={12} className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
          </div>
          <div className="flex items-center gap-3">
              {/* If media exists, show action button directly in header */}
              {media && !isOpen && (
                 <button 
                    onClick={(e) => {
                        e.preventDefault();
                        onOpenMedia(media);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                 >
                    <PlayCircle size={10} />
                    <span>Run</span>
                 </button>
              )}
              
              {!isOpen && !media && <span className="text-[9px] text-gray-600 uppercase tracking-widest animate-pulse">Internal Logic</span>}
              <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10"></div><div className="w-2 h-2 rounded-full bg-white/20"></div><div className="w-2 h-2 rounded-full bg-white/30"></div></div>
          </div>
      </summary>
      <div className="relative animate-in slide-in-from-top-2 fade-in duration-200">
          <SyntaxHighlighter {...props} children={codeStr} style={vscDarkPlus} language={language} PreTag="div" customStyle={{margin:0, padding:'1rem', background:'transparent', fontSize:'0.8em'}} />
      </div>
    </details>
  );
};

// --- MENSAJES ---
const Message = ({ role, content, media, onOpenMedia }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
       <div className={`
          relative max-w-[95%] lg:max-w-[85%] rounded-[30px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border backdrop-blur-[15px] transition-all duration-300
          ${isUser 
             ? 'bg-white/10 text-white rounded-br-sm border-white/10 hover:border-white/20' 
             : 'bg-white/[0.03] text-gray-200 rounded-bl-sm border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05]'}
       `}>
          {/* Avatar Name for AI */}
          {!isUser && (
             <div className="flex items-center gap-2 mb-4 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase border-b border-white/5 pb-2">
                 <Bot size={14} className="text-white"/> Cortex AI <span className="text-gray-700 mx-1">|</span> v2.0
             </div>
          )}

          {/* Markdown Content */}
          <div className={`prose prose-sm prose-invert max-w-none prose-p:leading-7 prose-headings:text-gray-100 prose-a:text-white prose-a:underline prose-a:underline-offset-4 prose-strong:text-white`}>
             <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                    code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        const contentStr = String(children).replace(/\n$/, '')
                        const isPythonLike = contentStr.includes('def ') || contentStr.includes('import ') || contentStr.includes('class ') || contentStr.includes('print(')
                        const language = match ? match[1] : (isPythonLike ? 'python' : 'text')
                        
                        return !inline ? (
                           <CodeBlock language={language} codeStr={contentStr} media={media /* Only pass media to codeblock if it generated it? Logic might need refine but for now show inline code handled by CodeBlock */} onOpenMedia={onOpenMedia} {...props} />
                        ) : (
                           <code className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-white/5" {...props}>{children}</code>
                        )
                    }
                }} 
             >{content}</ReactMarkdown>
          </div>

          {/* Inline Media Player */}
          {!isUser && media && (
              <div className="mt-6 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                 <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                         {media.type === 'video' ? <PlayCircle size={16} className="text-white"/> : <ImageIcon size={16} className="text-white"/>}
                         <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{media.type === 'video' ? 'Manim Animation' : 'Figure'}</span>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => {
                             const link = document.createElement('a');
                             link.href = media.type === 'video' ? `data:video/mp4;base64,${media.data}` : `data:image/png;base64,${media.data}`;
                             link.download = media.type === 'video' ? 'cortex.mp4' : 'cortex.png';
                             link.click();
                         }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Download size={14}/></button>
                         {/* We can still keep the expand button to open full visualizer if needed, or remove it.*/}
                         <button onClick={() => onOpenMedia(media)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Maximize2 size={14}/></button>
                    </div>
                 </div>
                 
                 <div className="relative w-full flex items-center justify-center p-4 bg-[url('/grid.svg')] bg-center">
                     {media.type === 'video' ? (
                         <video controls autoPlay loop className="w-full max-h-[500px] object-contain rounded-lg shadow-lg">
                             <source src={`data:video/mp4;base64,${media.data}`} type="video/mp4"/>
                         </video>
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
  const [sessions, setSessions] = useState([{id: 1, title: 'Sesión Principal', date: new Date()}])
  const [currentSessionId, setCurrentSessionId] = useState(1)
  const [messages, setMessages] = useState([{ role: 'assistant', content: '## Sistema Iniciado\n\nBienvenido a **CORTEX**. Soy tu motor de razonamiento matemático avanzado.\n\nEscribe cualquier expresión matemática en LaTeX y verás una vista previa instantánea.' }])
  const [input, setInput] = useState('')
  const [visualData, setVisualData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeMathTab, setActiveMathTab] = useState('common')
  const [showToolbox, setShowToolbox] = useState(false)
  const [toolboxSearch, setToolboxSearch] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!input.trim() || loading) return;
    const userText = input; setInput(''); setLoading(true);
    setMessages(p => [...p, { role: 'user', content: userText }])

    try {
      const { data } = await axios.post('http://localhost:8000/chat', { message: userText, context_id: `cortex-session-${currentSessionId}` })
      
      let newMedia = null
      if (data.video_base64) newMedia = { type: 'video', data: data.video_base64, code: data.code_executed }
      else if (data.image_base64) newMedia = { type: 'image', data: data.image_base64, code: data.code_executed }
      
      setMessages(p => [...p, { role: 'assistant', content: data.response, media: newMedia }])
      if (newMedia) setVisualData(newMedia)
    } catch (err) {
      setMessages(p => [...p, { role: 'assistant', content: `**System Error:** ${err.message}` }])
    }
    setLoading(false)
  }

  const createNewSession = () => {
     const newId = sessions.length + 1;
     setSessions([...sessions, {id: newId, title: `Sesión ${newId}`, date: new Date()}]);
     setCurrentSessionId(newId);
     setMessages([{ role: 'assistant', content: '## Nueva Sesión Iniciada\n\nContexto limpio. Listo para nuevos cálculos.' }]);
     setVisualData(null);
  }

  const insertLatex = (latex) => {
      // Force focus to ensure input mode is active
      inputRef.current?.focus();

      setTimeout(() => {
         const inputEl = inputRef.current?.inputElement;
         if (inputEl) {
             const start = inputEl.selectionStart || 0;
             const end = inputEl.selectionEnd || 0;
             const text = input;
             
             // Wrap inserted standard symbols in $ for auto-rendering
             // but user sees code while editing.
             const latexToInsert = `$${latex}$`; 
             const newText = text.substring(0, start) + latexToInsert + text.substring(end);
             setInput(newText);
             
             // Move cursor after insertion
             setTimeout(() => {
                 inputEl.focus();
                 const newCursorPos = start + latexToInsert.length;
                 inputEl.setSelectionRange(newCursorPos, newCursorPos);
             }, 10);
         } else {
             setInput(prev => prev + `$${latex}$`);
         }
      }, 50);
  }

  // --- UI RENDER ---

  return (
    <div className="w-screen h-screen bg-[#000] text-gray-200 overflow-hidden font-sans selection:bg-white/20 selection:text-white flex flex-row relative z-0">
         
         <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>

         {/* DARK BACKGROUND LAYER */}
         <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
             <div className="liquid-bg"></div>
         </div>

        {/* SIDEBAR - DARK GLASS */}
        <nav className={`relative z-20 flex flex-col liquid-glass-strong border-r border-white/5 transition-all duration-300 ease-spring h-full shrink-0 ${sidebarOpen ? 'w-72' : 'w-[70px]'}`}>
             
             {/* Logo Area */}
             <div className="h-20 flex items-center justify-center border-b border-white/5 shrink-0 bg-black/20">
                 <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 w-0'}`}>
                     <div className="p-2 rounded-xl bg-white/10 shadow-lg shadow-white/5"><Atom size={24} className="text-white"/></div>
                     <span className="font-bold text-xl tracking-tighter text-white">CORTEX</span>
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
                    <Tooltip key={s.id} text={s.title}>
                        <button 
                            onClick={() => setCurrentSessionId(s.id)}
                            className={`w-full p-3 rounded-xl flex items-center gap-4 ${sidebarOpen ? 'justify-start' : 'justify-center'} ${currentSessionId === s.id ? 'bg-white/20 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'} transition-all group border border-transparent`}
                        >
                            <MoreHorizontal size={20} className="group-hover:text-white transition-colors"/>
                            {sidebarOpen && <div className="text-left w-full overflow-hidden">
                                <div className="text-sm font-medium truncate">{s.title}</div>
                                <div className="text-[10px] text-gray-500">{s.date.toLocaleTimeString()}</div>
                            </div>}
                        </button>
                    </Tooltip>
                 ))}
             </div>

             {/* Footer Toggle */}
             <div className="p-4 border-t border-white/5 shrink-0">
                 <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full p-2 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                     {sidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                 </button>
             </div>
        </nav>

        {/* MAIN WORKSPACE - MONOCHROME */}
        <main className="flex-1 flex flex-col relative z-10 transition-all duration-300 h-full overflow-hidden backdrop-blur-[2px]">
            
            {/* Top Bar - DARK */}
            <header className="h-16 px-8 flex items-center justify-between border-b border-white/[0.05] liquid-glass sticky top-0 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
                        Connected
                    </span>
                    <div className="h-4 w-px bg-white/10"></div>
                    <span className="text-xs text-gray-600 font-mono">Session ID: {currentSessionId}</span>
                </div>
                <div className="flex gap-1 items-center">
                    <Tooltip text="Settings"><button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/5 rounded-lg hover:text-white text-gray-500 transition-colors"><Settings size={18}/></button></Tooltip>
                    <div className="w-px h-4 bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">U</span>
                    </div>
                </div>
            </header>

            {/* Split View Content */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                
                {/* Chat Column */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-20 animate-fade-in custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-6 pb-4">
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

                            {/* The input container */}
                            <form onSubmit={(e) => { e.preventDefault(); if(!loading) handleSubmit(e); }} 
                                  className="relative flex items-center rounded-[2rem] p-2 border border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-filter backdrop-blur-[20px] bg-white/[0.02] hover:bg-white/[0.04] active:scale-[0.995] focus-within:border-white/30 focus-within:shadow-white/10 z-20">
                                
                                {/* Toggle Toolbox Button */}
                                <Tooltip text="Open Math Tools"><button 
                                    type="button"
                                    onClick={() => setShowToolbox(!showToolbox)}
                                    className={`pl-4 pr-2 text-gray-500 hover:text-white transition-colors ${showToolbox ? 'text-white' : ''}`}
                                >
                                    <Calculator size={20} className="hover:rotate-12 transition-transform"/>
                                </button></Tooltip>
                                
                                {/* Input Editor */}
                                <div className="w-full px-4 py-3 cursor-text rounded-xl hover:bg-white/[0.02] transition-colors" onClick={() => {
                                    inputRef.current?.focus();
                                }}>
                                    <LiveLatexInput
                                        ref={inputRef}
                                        value={input}
                                        onChange={setInput}
                                        placeholder="Escribe texto y matemáticas..."
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
                            <div className="text-center mt-3 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] opacity-40 flex justify-center gap-4">
                                <span className="flex items-center gap-1"><Sigma size={10}/> LaTeX Supported</span> • <span className="flex items-center gap-1"><PlayCircle size={10}/> Manim Engine Ready</span>
                            </div>
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
            </div>
        </main>
    </div>
  )
}

export default App
