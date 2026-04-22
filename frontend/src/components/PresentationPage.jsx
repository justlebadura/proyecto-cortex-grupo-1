import React, { useEffect, useMemo, useState } from 'react'

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
  'rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)]'

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
          <h3 className="text-white font-bold">Perfil del agente</h3>
          <img
            src="https://github.com/user-attachments/assets/03f2e690-f7a6-4541-b5eb-510a139cd1f6"
            alt="Perfil del agente"
            className="mt-3 w-full rounded-xl border border-white/10"
          />
        </article>

        <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-white font-bold">Necesidad de cada proceso</h3>
          <div className="mt-4 space-y-4">
            {profileScores.map((score) => (
              <div key={score.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{score.label}</p>
                  <p className="text-xs text-gray-300">{score.value}/{score.max}</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-white to-gray-400" style={{ width: `${(score.value / score.max) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-400">{score.reason}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <img
          src="https://github.com/user-attachments/assets/db778299-7d6d-4c46-a4d2-7c28cdee7e09"
          alt="Necesidad de cada proceso"
          className="w-full rounded-xl border border-white/10"
        />
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
        <img
          src="https://github.com/user-attachments/assets/51ac00ca-9f38-4a98-b249-c6520d5d4fbe"
          alt="Flujo del agente"
          className="w-full rounded-xl border border-white/10"
        />
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
          <h3 className="text-white font-bold">Diagrama conceptual</h3>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-gray-500">Msg -4</div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-gray-500">Msg -3</div>
              <div className="rounded-lg border border-white/20 bg-white/[0.08] p-3 text-white">Msg -2</div>
              <div className="rounded-lg border border-white/20 bg-white/[0.08] p-3 text-white">Msg -1</div>
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-emerald-200">Msg actual</div>
            </div>
            <p className="mt-3 text-xs text-gray-400">Los bloques con baja prioridad salen de ventana al ingresar nuevos turnos.</p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-white font-bold">Referencias visuales</h3>
          <div className="mt-3 space-y-3">
            <img
              src="https://github.com/user-attachments/assets/c8fd9141-30f8-499f-834f-870b52293434"
              alt="Ventana de contexto 1"
              className="w-full rounded-xl border border-white/10"
            />
            <img
              src="https://github.com/user-attachments/assets/0937ea07-b4d4-411a-a806-0c502e8b432b"
              alt="Ventana de contexto 2"
              className="w-full rounded-xl border border-white/10"
            />
          </div>
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
          <h3 className="text-white font-bold">4.2 Manejo de ambiguedad</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <p><span className="text-white font-semibold">Input ambiguo:</span> "Genial, otra vez se bloqueo el sistema".</p>
            <p><span className="text-white font-semibold">Decision:</span> adjetivo positivo aplicado a evento tecnico negativo.</p>
            <p><span className="text-white font-semibold">Respuesta esperada:</span> analisis tecnico de causa raiz.</p>
          </div>
          <img
            src="https://github.com/user-attachments/assets/32ac6f8d-119d-49a3-abf5-bd86d25fb5fb"
            alt="Deteccion de sarcasmo"
            className="mt-4 w-full rounded-xl border border-white/10"
          />
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

function PresentationPage({ onPresentingChange }) {
  const [isPresenting, setIsPresenting] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [transitionDirection, setTransitionDirection] = useState('forward')

  const slides = useMemo(
    () => [
      { id: 'intro', title: 'Introduccion', node: <SlideIntro /> },
      { id: 'fase1', title: 'Fase 1', node: <SlidePhase1 /> },
      { id: 'fase2a', title: 'Fase 2A', node: <SlidePhase2A /> },
      { id: 'fase2b', title: 'Fase 2B', node: <SlidePhase2B /> },
      { id: 'fase3a', title: 'Fase 3A', node: <SlidePhase3A /> },
      { id: 'fase3b', title: 'Fase 3B', node: <SlidePhase3B /> },
      { id: 'fase4', title: 'Fase 4', node: <SlidePhase4 /> },
      { id: 'conclusion', title: 'Conclusion', node: <SlideConclusion /> },
    ],
    []
  )

  const goPrev = () => {
    setTransitionDirection('backward')
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goNext = () => {
    setTransitionDirection('forward')
    setActiveSlide((prev) => (prev + 1) % slides.length)
  }

  useEffect(() => {
    if (onPresentingChange) onPresentingChange(isPresenting)
  }, [isPresenting, onPresentingChange])

  useEffect(() => {
    if (!isPresenting) return

    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') goNext()
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') goPrev()
      if (event.key === 'Escape') setIsPresenting(false)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPresenting, slides.length])

  const toolbarWrapperClass = isPresenting
    ? 'sticky top-0 z-40 mb-4 h-16 group'
    : 'sticky top-0 z-40 mb-4 py-3 px-2 md:px-0 backdrop-blur-md'

  const toolbarInnerClass = isPresenting
    ? 'max-w-7xl mx-auto mt-2 px-2 md:px-0 transition-all duration-300 opacity-0 -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0'
    : 'max-w-7xl mx-auto'

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-5 md:px-10 lg:px-14 py-8">
      <div className={toolbarWrapperClass}>
        <div className={toolbarInnerClass}>
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
            <div className="text-xs uppercase tracking-[0.22em] text-gray-400">Modo presentacion</div>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.03] hover:bg-white/10 text-white">Anterior</button>
              <button onClick={goNext} className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/[0.03] hover:bg-white/10 text-white">Siguiente</button>
              <button
                onClick={() => setIsPresenting((value) => !value)}
                className={`px-3 py-2 rounded-xl text-sm border text-white ${
                  isPresenting
                    ? 'border-emerald-300/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : 'border-white/20 bg-white/10 hover:bg-white/20'
                }`}
              >
                {isPresenting ? 'Salir de presentar' : 'Presentar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPresenting ? (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-180px)] flex flex-col justify-center pb-8">
          <div key={`${slides[activeSlide].id}-${transitionDirection}`} className={`slide-frame ${transitionDirection === 'forward' ? 'slide-forward' : 'slide-backward'}`}>
            {slides[activeSlide].node}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Diapositiva {activeSlide + 1} de {slides.length}</div>
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setTransitionDirection(index > activeSlide ? 'forward' : 'backward')
                    setActiveSlide(index)
                  }}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${activeSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/25 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {slides.map((slide) => (
            <div key={slide.id}>{slide.node}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PresentationPage
