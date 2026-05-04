import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { 
  Bot, User, Brain, Activity, Layers, MessageSquare, Zap, 
  Database, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck,
  TrendingUp, TrendingDown, Gauge, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react'

// --- COMPONENTES VISUALES PROPIOS (REEMPLAZAN IMÁGENES EXTERNAS) ---

const AgentProfileCard = () => (
  <div className="w-full aspect-[16/9] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-black/40 overflow-hidden flex flex-col items-center justify-center p-8 relative group hover:border-white/30 transition-all duration-500 shadow-2xl">
    <div className="absolute top-4 right-6 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Active System</span>
    </div>
    
    <div className="flex items-center gap-8 z-10 group-hover:scale-105 transition-transform duration-500">
      <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:bg-white/10 transition-colors">
        <Bot size={64} className="text-white" />
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-3xl font-black text-white tracking-tighter">JHAN AI</h4>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">Cortex Protocol v2.0</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Socrático', 'Riguroso', 'Analítico'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase hover:bg-white/10 transition-colors cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
    
    <div className="mt-8 grid grid-cols-3 gap-12 w-full max-w-lg opacity-60 group-hover:opacity-100 transition-opacity">
      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Misión</p>
        <p className="text-xs text-gray-200">Guía Matemática</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Especialidad</p>
        <p className="text-xs text-gray-200">Cálculo Avanzado</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Protocolo</p>
        <p className="text-xs text-gray-200">Enseñanza Lógica</p>
      </div>
    </div>
  </div>
)

const ProcessRadar = () => {
  const stats = [
    { label: 'Razonamiento', value: 8 },
    { label: 'Lógica', value: 9 },
    { label: 'Matemáticas', value: 10 },
    { label: 'Emoción', value: 1 },
    { label: 'Memoria', value: 7 },
    { label: 'Atención', value: 8 }
  ]
  
  return (
    <div className="w-full aspect-[16/9] rounded-2xl border border-white/10 bg-black/40 p-6 flex items-center justify-center gap-8">
      <div className="flex-1 space-y-3">
        {stats.map(s => (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
              <span className="text-gray-400">{s.label}</span>
              <span className={s.value > 5 ? 'text-white' : 'text-red-400'}>{s.value}/10</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${s.label === 'Emoción' ? 'bg-red-500/50' : 'bg-white/40'}`}
                style={{ width: `${s.value * 10}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
      <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative">
        <div className="absolute inset-0 border border-white/5 rounded-full scale-75" />
        <div className="absolute inset-0 border border-white/5 rounded-full scale-50" />
        <Brain size={48} className="text-white/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity size={100} className="text-emerald-500/20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

const FlowDiagram = () => (
  <div className="w-full aspect-[21/9] rounded-2xl border border-white/10 bg-black/40 p-4 md:p-8 flex items-center justify-between relative overflow-x-auto custom-scrollbar">
    <div className="absolute inset-0 opacity-10 pointer-events-none min-w-[600px]">
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 -translate-y-1/2" />
    </div>
    
    <div className="flex items-center justify-between min-w-[600px] w-full">
      {[
        { label: 'Input', icon: <MessageSquare size={20}/>, desc: 'Entrada Usuario' },
        { label: 'Gatekeeper', icon: <ShieldCheck size={20}/>, desc: 'Filtro de Ruido' },
        { label: 'Cortex', icon: <Brain size={20}/>, desc: 'Motor Lógico' },
        { label: 'Output', icon: <Zap size={20}/>, desc: 'Respuesta' }
      ].map((step, i, arr) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-3 z-10 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-lg">
              {step.icon}
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white">{step.label}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-1">{step.desc}</p>
            </div>
          </div>
          {i < arr.length - 1 && (
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/40 to-white/10 mx-2 md:mx-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
)

const ContextWindowVisual = () => (
  <div className="w-full aspect-video rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col">
    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className="text-emerald-400 animate-spin-slow" />
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Active Context Window</span>
      </div>
      <span className="text-[10px] font-mono text-gray-500">8192 tokens</span>
    </div>
    
    <div className="flex-1 flex flex-col gap-3 justify-end overflow-hidden">
      <div className="h-12 w-3/4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center px-4 self-start opacity-20 scale-90 -translate-y-8">
        <p className="text-[10px] text-gray-600 font-mono">Message t-4: Discarded from context...</p>
      </div>
      <div className="h-12 w-2/3 rounded-xl border border-white/10 bg-white/[0.04] flex items-center px-4 self-end opacity-40 -translate-y-4">
        <p className="text-[10px] text-gray-400 font-mono">Message t-3: Archiving to LTM</p>
      </div>
      <div className="h-12 w-5/6 rounded-xl border border-white/20 bg-white/[0.08] flex items-center px-4 self-start">
        <p className="text-[10px] text-gray-200 font-mono">Message t-2: Critical variables identified</p>
      </div>
      <div className="h-12 w-4/5 rounded-xl border border-white/30 bg-white/10 flex items-center px-4 self-end border-l-4 border-l-emerald-500">
        <p className="text-[10px] text-white font-mono">Message t-1: Processing instruction...</p>
      </div>
    </div>
  </div>
)

const MemoryHierarchy = () => (
  <div className="w-full aspect-video rounded-2xl border border-white/10 bg-black/40 p-8 flex items-center justify-center gap-12">
    <div className="flex flex-col items-center gap-4">
      <div className="w-40 h-28 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 flex flex-col items-center justify-center gap-2 relative">
        <div className="absolute -top-3 px-3 py-1 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase">Short Term</div>
        <Gauge size={24} className="text-emerald-400" />
        <span className="text-xs text-white font-bold">Working Memory</span>
      </div>
      <p className="text-[9px] text-gray-500 uppercase text-center max-w-[120px]">Contexto actual y variables inmediatas</p>
    </div>
    
    <div className="h-12 w-px bg-white/20" />
    
    <div className="flex flex-col items-center gap-4">
      <div className="w-48 h-40 rounded-2xl border-2 border-white/20 bg-white/5 flex flex-col items-center justify-center gap-3 relative shadow-2xl">
        <div className="absolute -top-3 px-3 py-1 rounded-full bg-white text-black text-[9px] font-black uppercase">Long Term</div>
        <Database size={32} className="text-white" />
        <div className="space-y-1 text-center">
          <span className="block text-xs text-white font-bold">Knowledge Base</span>
          <span className="block text-[9px] text-gray-400 italic">Matemáticas + Historial</span>
        </div>
      </div>
      <p className="text-[9px] text-gray-500 uppercase text-center max-w-[140px]">Base semántica y errores recurrentes</p>
    </div>
  </div>
)

const SarcasmDetector = () => (
  <div className="w-full aspect-[16/9] rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col">
    <div className="flex items-center gap-3 mb-8">
      <AlertCircle size={20} className="text-amber-500" />
      <h4 className="text-sm font-black text-white uppercase tracking-widest">Detector de Inconsistencia Pragmática</h4>
    </div>
    
    <div className="flex-1 flex items-center justify-around relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black">
        <RefreshCw size={24} className="text-white/40 animate-spin-slow" />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-xs font-mono text-white">"¡Qué brillante!"</span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold">Sentimiento (+)</span>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
          <TrendingDown size={16} className="text-red-400" />
          <span className="text-xs font-mono text-white">"El sistema falló"</span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-bold">Evento (-)</span>
      </div>
    </div>
    
    <div className="mt-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <CheckCircle2 size={16} className="text-amber-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-white uppercase">Sarcasmo Detectado</p>
          <p className="text-[10px] text-amber-200/60">Activando protocolo: Ignorar emoción / Responder tecnicismo</p>
        </div>
      </div>
      <div className="flex gap-1">
        {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />)}
      </div>
    </div>
  </div>
)

const IntegrationsVisual = () => (
  <div className="w-full aspect-video rounded-2xl border border-white/10 bg-black/40 p-8 flex flex-col gap-6">
    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
      <Layers size={24} className="text-purple-400" />
      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Sistemas de Integración Avanzada</h4>
    </div>
    
    <div className="flex-1 grid grid-cols-2 gap-8">
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors" />
        <div className="flex items-center gap-3 text-purple-300">
          <Zap size={20} />
          <span className="font-bold uppercase text-xs tracking-widest">Function Calling</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Capacidad del agente para ejecutar herramientas externas en tiempo real.
        </p>
        <div className="mt-auto space-y-2">
          {['Render Manim', 'Plot Matplotlib', 'Cálculo Simbólico'].map(tool => (
            <div key={tool} className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <div className="w-1 h-1 rounded-full bg-purple-500" />
              {tool}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
        <div className="flex items-center gap-3 text-blue-300">
          <Database size={20} />
          <span className="font-bold uppercase text-xs tracking-widest">UltraContext</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Sistema de compresión y recuperación de memoria profunda.
        </p>
        <div className="mt-auto flex items-center gap-4">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-4/5 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-blue-400">92% Hit Rate</span>
        </div>
      </div>
    </div>
  </div>
)

// --- COMPONENTES UI REUTILIZABLES ---

const participants = [
  'Castro Jimenez Andres David',
  'Argumedo Mejia Libardo Enrique',
  'Prasca Pedraza Kheylor Daniel',
]

const profileScores = [
  {
    label: 'Procesamiento linguistico',
    value: 6,
    max: 10,
    reason: 'Debe explicar con claridad y adaptar el lenguaje tecnico al nivel del estudiante.',
  },
  {
    label: 'Aprendizaje y memoria',
    value: 6,
    max: 10,
    reason: 'Debe conservar progreso de clase, errores recurrentes y contexto reciente.',
  },
  {
    label: 'Pensamiento y razonamiento',
    value: 8,
    max: 10,
    reason: 'La mayor fortaleza del agente es resolver problemas matematicos con logica.',
  },
  {
    label: 'Atencion',
    value: 6,
    max: 10,
    reason: 'Mantiene continuidad de pasos y evita desviaciones en explicaciones largas.',
  },
  {
    label: 'Emocion',
    value: 1,
    max: 10,
    reason: 'No busca simular empatia; prioriza exactitud, estructura y enfoque academico.',
  },
]

const flowSteps = [
  'Input del estudiante',
  'Normalizacion del mensaje',
  'Filtro de atencion (si >500 palabras)',
  'Construccion de prompt instruccional',
  'Razonamiento del modelo',
  'Generacion visual (Manim/Matplotlib)',
  'Respuesta academica + material descargable',
]

const memoryRows = [
  ['LTM Semantica', 'Aritmetica', 'Operaciones basicas', 'Suma, resta, multiplicacion', 'Resolver ejercicios simples'],
  ['LTM Semantica', 'Algebra', 'Ecuaciones', '2x + 3 = 7', 'Explicar y resolver ecuaciones'],
  ['LTM Semantica', 'Geometria', 'Formulas', 'Area del circulo = pi r^2', 'Calcular areas y perimetros'],
  ['LTM Semantica', 'Trigonometria', 'Razones trigonometricas', 'sen, cos, tan', 'Resolver triangulos'],
  ['LTM Semantica', 'Calculo', 'Derivadas', 'd/dx (x^2) = 2x', 'Explicar cambios y pendientes'],
  ['LTM Semantica', 'Estadistica', 'Medidas', 'Media, mediana, moda', 'Analizar datos'],
  ['LTM Semantica', 'Formulas importantes', 'Formulas clave', 'Formula general cuadratica', 'Resolver ecuaciones'],
  ['LTM Semantica', 'Reglas', 'Propiedades', 'Propiedad distributiva', 'Simplificar expresiones'],
  ['LTM Semantica', 'Ejemplos', 'Problemas resueltos', 'Ejercicio paso a paso', 'Ensenar con ejemplos'],
  ['LTM Episodica', 'Errores comunes', 'Conceptos mal entendidos', 'Confusion de signos', 'Corregir al estudiante'],
]

const styleGuideRows = [
  [
    'Tono',
    'Formal, socratico y analitico. Distancia profesional con estimulo intelectual.',
    '"El planteamiento es interesante; sin embargo, analicemos las variables desde una perspectiva distinta."',
  ],
  [
    'Uso de emojis',
    'Prohibido. La autoridad del mensaje se basa en precision linguistica.',
    '"Procederemos a desglosar el algoritmo paso a paso."',
  ],
  [
    'Lenguaje / jerga',
    'Tecnico y riguroso. Conceptos complejos se explican con fundamento teorico.',
    '"Este fenomeno se denomina recursividad: un sistema definido en terminos de si mismo."',
  ],
  [
    'Longitud',
    'Breve pero densa en contenido. Sin verbosidad innecesaria.',
    'Sintesis academica con secuencia logica explicita.',
  ],
]

const introPrinciples = [
  'Rigor pedagogico y evaluacion logica de cada paso.',
  'Visualizacion matematica para reducir ambiguedad conceptual.',
  'Continuidad de sesion para mantener progreso del estudiante.',
  'Sintesis bajo carga en consultas extensas.',
]

const conclusionItems = [
  'El agente combina explicacion conceptual y resolucion operativa.',
  'El filtro de atencion mejora robustez ante entradas extensas.',
  'La base de memoria permite cobertura matematica transversal.',
  'La identidad de catedratico mantiene consistencia discursiva.',
  'La evolucion natural es adaptacion personalizada por estudiante.',
]

const slideBase =
  'rounded-3xl border border-white/10 bg-black/90 p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-h-[500px] w-full backdrop-blur-md relative z-10'

function SlideHeader({ title, tag }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h2>
      <span className="text-xs px-3 py-1 rounded-full border border-white/15 text-gray-300 bg-white/[0.03]">{tag}</span>
    </div>
  )
}

function SlideIntro() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-black/60 p-6 md:p-10">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-zinc-400/10 blur-3xl pointer-events-none" />

      <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 mb-3">proyecto-cortex-grupo-1 · profesor de matematicas</p>
      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Presentacion tecnica del bot docente JHAN AI</h1>
      <p className="mt-4 text-gray-300 max-w-4xl leading-relaxed">
        Presentacion estructurada para exponer el diseno del agente, su arquitectura de atencion, su memoria didactica
        y su estilo conversacional academico.
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-white font-bold">Inciso de introduccion</h3>
        <p className="mt-2 text-sm text-gray-300 leading-relaxed">
          El objetivo central es construir un profesor de calculo que no solo responda resultados, sino que ensene con
          logica, visuales y acompanamiento metodologico para que el estudiante comprenda por que cada paso es valido.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {introPrinciples.map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-gray-200">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {participants.map((name) => (
          <span key={name} className="px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-xs text-gray-200">
            {name}
          </span>
        ))}
      </div>

      <a
        href="https://miro.com/welcomeonboard/Y0FLRzVCOXE5Z3pOYTUyMFliaXhEdnptUXkxRzhiWlFtVStXejRkQTZNcDdCUHZ5UytsT0xwblFoTUpzTWtRYXFsWGVjMm51NVNzNC82eVJFdU5qd0tFMFVlb2ZPVE9TMkUyT0M4eG02eDlJcklIcDBIRFVDb1ExVkkyNG1oTzRNakdSWkpBejJWRjJhRnhhb1UwcS9BPT0hdjE=?share_link_id=424295732256"
        target="_blank"
        rel="noreferrer"
        className="inline-flex mt-5 px-4 py-2 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white/10 transition-colors text-white"
      >
        Enlace colaborativo de Miro
      </a>
    </section>
  )
}

function SlidePhase1() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 1 · Perfil del agente" tag="Mision + capacidades" />
      <p className="text-gray-300 leading-relaxed">
        Mision: ensenar calculo de la forma mas clara posible, con soporte visual y explicaciones avanzadas que se
        adaptan al ritmo del estudiante.
      </p>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold mb-4">1.1 Perfil del Agente</h3>
          <AgentProfileCard />
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold mb-4">Gráfico de Necesidad</h3>
          <ProcessRadar />
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300 leading-relaxed">
        Justificacion: razonamiento en 8/10 por su papel central en resolucion matematica; lenguaje, memoria y atencion
        en 6/10 para claridad y continuidad; emocion en 1/10 por prioridad tecnica sobre simulacion afectiva.
      </div>
    </section>
  )
}

function SlidePhase2A() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 2A · Flujo del agente" tag="Pipeline operativo" />

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <FlowDiagram />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {flowSteps.map((step, index) => (
          <div key={step} className="rounded-xl border border-white/10 bg-black/40 p-3 relative">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Paso {index + 1}</p>
            <p className="text-sm text-white font-semibold mt-1">{step}</p>
            {index < flowSteps.length - 1 && <span className="hidden xl:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-500">-&gt;</span>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Entrada multimodal</h4>
          <p className="mt-2 text-sm text-gray-300">Texto, formulas LaTeX y solicitud visual en una sola interaccion.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Orquestacion por sesion</h4>
          <p className="mt-2 text-sm text-gray-300">Context_id por sesion para continuidad pedagogica real.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Salida verificable</h4>
          <p className="mt-2 text-sm text-gray-300">Respuesta textual + recurso visual + trazabilidad de ejecucion.</p>
        </article>
      </div>
    </section>
  )
}

function SlidePhase2B() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 2B · Arquitectura de atencion" tag="Gatekeeper + heuristicas" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold">Reglas de atencion selectiva</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Umbral de activacion: mensajes mayores a 500 palabras.</li>
            <li>Extraccion de sustantivos clave para eliminar ruido linguistico.</li>
            <li>Anclaje final: peso alto de la ultima frase (efecto de recencia).</li>
            <li>Salida: input sintetizado para mantener foco de ejecucion.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold">Pseudocodigo</h3>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/15 bg-[#0a0a0a] p-4 text-xs text-gray-200">
{`if len(mensaje.split()) > 500:
    sustantivos = extraer_entidades_clave(mensaje)
    instruccion_final = mensaje.split('.')[-1]
    input_procesable = f"{sustantivos} + {instruccion_final}"
    ejecutar_atencion(input_procesable)
else:
    procesar_full_text(mensaje)`}
          </pre>
        </article>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Beneficio operativo</h4>
          <p className="mt-2 text-sm text-gray-300">Reduce dispersion en prompts largos y mejora precision de respuesta.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Riesgo y control</h4>
          <p className="mt-2 text-sm text-gray-300">Se evita sobre-resumen activando la heuristica solo en mensajes extensos.</p>
        </article>
      </div>
    </section>
  )
}

function SlidePhase3A() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 3A · Base de conocimiento" tag="Memoria semantica" />

      <p className="text-gray-300 leading-relaxed">
        La base de conocimiento organiza dominios matematicos, formulas, propiedades y errores comunes para ensenar con
        continuidad y detectar fallas de comprension durante la resolucion.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 overflow-hidden">
        <h3 className="text-white font-bold">Esquema de memoria</h3>
        <div className="mt-4 overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left text-xs md:text-sm">
            <thead className="text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-2 pr-4">Tipo de memoria</th>
                <th className="py-2 pr-4">Categoria</th>
                <th className="py-2 pr-4">Tipo de contenido</th>
                <th className="py-2 pr-4">Ejemplo</th>
                <th className="py-2 pr-4">Uso en el bot</th>
              </tr>
            </thead>
            <tbody>
              {memoryRows.map((row) => (
                <tr key={row.join('-')} className="border-t border-white/10">
                  {row.map((cell) => (
                    <td key={cell} className="py-2 pr-4 text-gray-200">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Cobertura transversal</h4>
          <p className="mt-2 text-sm text-gray-300">Desde aritmetica hasta calculo con consistencia terminologica.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Enfoque en errores</h4>
          <p className="mt-2 text-sm text-gray-300">Intervencion temprana sobre confusiones de signos y reglas.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Transferencia didactica</h4>
          <p className="mt-2 text-sm text-gray-300">Ejemplos resueltos reutilizables en ejercicios nuevos.</p>
        </article>
      </div>
    </section>
  )
}

function SlidePhase3B() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 3B · Ventana de contexto" tag="Memoria de trabajo" />

      <p className="text-gray-300 leading-relaxed">
        La ventana de contexto conserva turnos recientes para coherencia local. Cuando se llena, desplaza mensajes
        antiguos y se apoya en memoria de largo plazo para sostener continuidad semantica.
      </p>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-white font-bold mb-4">Ventana de Contexto Actual</h3>
          <ContextWindowVisual />
          <p className="mt-3 text-xs text-gray-400">Los bloques con baja prioridad salen de ventana al ingresar nuevos turnos.</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-white font-bold mb-4">Jerarquía de Memoria</h3>
          <MemoryHierarchy />
        </article>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Ventaja principal</h4>
          <p className="mt-2 text-sm text-gray-300">Mejora consistencia de respuestas en secuencias largas.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white">Limite operativo</h4>
          <p className="mt-2 text-sm text-gray-300">El contexto reciente compite por espacio; por eso se combina con memoria semantica.</p>
        </article>
      </div>
    </section>
  )
}

function SlidePhase4() {
  return (
    <section className={slideBase}>
      <SlideHeader title="FASE 4 · Modelo de catedratico universitario" tag="Pragmatica + estilo" />

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 overflow-hidden">
        <h3 className="text-white font-bold">4.1 Guia de estilo</h3>
        <div className="mt-4 overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left text-xs md:text-sm">
            <thead className="text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-2 pr-4">Elemento</th>
                <th className="py-2 pr-4">Regla logica</th>
                <th className="py-2 pr-4">Ejemplo de output</th>
              </tr>
            </thead>
            <tbody>
              {styleGuideRows.map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="py-2 pr-4 text-white font-semibold">{row[0]}</td>
                  <td className="py-2 pr-4 text-gray-200">{row[1]}</td>
                  <td className="py-2 pr-4 text-gray-300">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-white font-bold mb-4">4.2 Manejo de ambiguedad y Sarcasmo</h3>
          <div className="mb-4 space-y-2 text-sm text-gray-300">
            <p><span className="text-white font-semibold">Input ambiguo:</span> "Genial, otra vez se bloqueo el sistema".</p>
            <p><span className="text-white font-semibold">Decision:</span> adjetivo positivo aplicado a evento tecnico negativo.</p>
          </div>
          <SarcasmDetector />
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold">4.3 y 4.5 Simulaciones</h3>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-white font-semibold">Golden sample:</span> ante frustracion, el bot no abandona rigor
              y reconduce con preguntas socraticas.
            </p>
            <p className="rounded-xl border border-emerald-300/20 bg-emerald-500/5 p-3">
              <span className="text-emerald-200 font-semibold">Escenario de exito:</span> explica regla de la cadena
              separando funcion externa e interna para razonamiento paso a paso.
            </p>
            <p className="rounded-xl border border-amber-300/20 bg-amber-500/5 p-3">
              <span className="text-amber-200 font-semibold">Escenario de recuperacion:</span> ante sarcasmo y sobrecarga,
              sintetiza y mantiene direccion tecnica.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}

function SlideConclusion() {
  return (
    <section className={slideBase}>
      <SlideHeader title="Cierre · Conclusion" tag="Resultados y proyeccion" />

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-white font-bold">Inciso de conclusion</h3>
        <p className="mt-2 text-sm text-gray-300 leading-relaxed">
          JHAN AI se consolida como prototipo de catedratico digital: integra razonamiento, atencion selectiva, memoria
          estructurada y discurso academico consistente para ensenanza de calculo.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {conclusionItems.map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-gray-200">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4">
        <p className="text-sm text-emerald-100">
          Proximo paso util: personalizacion por perfil de estudiante y analitica de progreso para adaptar profundidad,
          ritmo y tipo de visualizacion.
        </p>
      </div>
    </section>
  )
}

function SlideIntegrations() {
  return (
    <section className={slideBase}>
      <SlideHeader title="EXTRAS · Integraciones Críticas" tag="Tools + Context" />
      <p className="text-gray-300 leading-relaxed mb-6">
        Más allá del modelo base, JHAN AI utiliza protocolos de integración para interactuar con el mundo real y gestionar el conocimiento infinito.
      </p>
      <IntegrationsVisual />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={14} className="text-purple-400" /> Function Calling
          </h4>
          <p className="mt-2 text-xs text-gray-400">
            Permite al bot "salir" de su caja de texto para generar videos de Manim o gráficas exactas, eliminando alucinaciones visuales.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Database size={14} className="text-blue-400" /> UltraContext
          </h4>
          <p className="mt-2 text-xs text-gray-400">
            Gestiona la memoria episódica. No solo recuerda qué se dijo, sino cómo falló el estudiante anteriormente para ajustar su pedagogía.
          </p>
        </article>
      </div>
    </section>
  )
}

function PresentationPage({ isPresenting, setIsPresenting }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [hasScroll, setHasScroll] = useState(false);
  const slideContainerRef = useRef(null);

  const slides = useMemo(() => [
    { id: 'intro', node: <SlideIntro /> },
    { id: 'fase1', node: <SlidePhase1 /> },
    { id: 'fase2a', node: <SlidePhase2A /> },
    { id: 'fase2b', node: <SlidePhase2B /> },
    { id: 'fase3a', node: <SlidePhase3A /> },
    { id: 'fase3b', node: <SlidePhase3B /> },
    { id: 'integrations', node: <SlideIntegrations /> },
    { id: 'fase4', node: <SlidePhase4 /> },
    { id: 'conclusion', node: <SlideConclusion /> },
  ], []);

  const total = slides.length;
  
  const next = useCallback(() => {
    setDirection('forward');
    setActiveSlide((s) => (s + 1) % total);
  }, [total]);
  
  const prev = useCallback(() => {
    setDirection('backward');
    setActiveSlide((s) => (s - 1 + total) % total);
  }, [total]);

  // Detect query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'presentation') {
      setIsPresenting(true);
    }
  }, []);

  // Detectar si la diapositiva tiene overflow (si es muy grande para el encuadre)
  useEffect(() => {
    if (!isPresenting) return;
    
    const checkOverflow = () => {
      if (slideContainerRef.current) {
        const { scrollHeight, clientHeight } = slideContainerRef.current;
        setHasScroll(scrollHeight > clientHeight + 5); // +5px buffer
      }
    };

    // Revisar tras un pequeño delay para asegurar que el DOM se haya pintado
    const timeoutId = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [activeSlide, isPresenting]);

  useEffect(() => {
    if (!isPresenting) return;

    const handleKey = (e) => {
      // Ignorar navegación si estamos en un elemento editable/focuseado
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Si la diapositiva tiene scroll, permitir que 'ArrowDown' y 'ArrowUp' la muevan 
      // en vez de cambiar de diapositiva (Opcional: podemos dejar las flechas laterales para cambiar)
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowDown') {
        if (slideContainerRef.current) {
          slideContainerRef.current.scrollBy({ top: 50, behavior: 'smooth' });
        }
      }
      if (e.key === 'ArrowUp') {
        if (slideContainerRef.current) {
          slideContainerRef.current.scrollBy({ top: -50, behavior: 'smooth' });
        }
      }
      if (e.key === 'Escape') setIsPresenting(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPresenting, next, prev]);

  // VISTA DE PRESENTACIÓN (OVERLAY FORZADO)
  if (isPresenting) {
    return (
      <div 
        className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center p-8 overflow-hidden"
        style={{ zIndex: 99999 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

        {/* Controles superiores */}
        <div className="absolute top-0 w-full h-32 flex justify-center items-start pt-8 z-[10000] opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-4 items-center liquid-glass px-4 py-2 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md">
            <button onClick={prev} className="p-2 glass-button"><ChevronLeft size={20}/></button>
            <span className="text-white/60 font-mono text-sm">{activeSlide + 1} / {total}</span>
            <button onClick={next} className="p-2 glass-button"><ChevronRight size={20}/></button>
            <button 
              onClick={() => setIsPresenting(false)} 
              className="ml-4 px-4 py-2 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest"
            >
              Salir (Esc)
            </button>
          </div>
        </div>

        {/* Diapositiva actual con contenedor scrollable si es necesario */}
        <div 
          key={activeSlide} 
          ref={slideContainerRef}
          className={`w-full max-w-[1200px] slide-frame ${direction === 'forward' ? 'slide-forward' : 'slide-backward'} 
                     overflow-y-auto max-h-[85vh] rounded-3xl custom-scrollbar relative px-2 pb-4 pt-1`}
        >
          {slides[activeSlide].node}
        </div>

        {/* Indicador visual inferior */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 z-[10000]">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`} 
              />
            ))}
          </div>
          <div className="w-px h-3 bg-white/20"></div>
          <span className="text-xs font-mono font-bold text-white/80 tracking-widest">
            {activeSlide + 1} / {total}
          </span>
        </div>
      </div>
    );
  }

  // VISTA NORMAL (SCROLL)
  return (
    <div className="h-full overflow-y-auto bg-[#020202] p-8 custom-scrollbar">
      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-white text-4xl font-black tracking-tighter">Proyecto JHAN AI</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mt-2">Cortex Protocol · Documentación Técnica</p>
        </div>
        <button 
          onClick={() => setIsPresenting(true)}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase tracking-widest"
        >
          Presentar Proyecto
        </button>
      </div>

      <div className="flex flex-col gap-20 maxWidth-[1200px] mx-auto pb-20">
        {slides.map((s) => (
          <div key={s.id}>{s.node}</div>
        ))}
      </div>
    </div>
  );
}

export default PresentationPage
