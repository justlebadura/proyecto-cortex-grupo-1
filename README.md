# proyecto-cortex-grupo-1-Profesor de matematicas 

## participantes
Castro Jimenez Andrés David<br>
Argumedo Mejia Libardo Enrique<br>
Prasca Pedraza Kheylor Daniel<br>

[enlace colaborativo de miro](https://miro.com/welcomeonboard/Y0FLRzVCOXE5Z3pOYTUyMFliaXhEdnptUXkxRzhiWlFtVStXejRkQTZNcDdCUHZ5UytsT0xwblFoTUpzTWtRYXFsWGVjMm51NVNzNC82eVJFdU5qd0tFMFVlb2ZPVE9TMkUyT0M4eG02eDlJcklIcDBIRFVDb1ExVkkyNG1oTzRNakdSWkpBejJWRjJhRnhhb1UwcS9BPT0hdjE=?share_link_id=424295732256)

# FASE 1

## 1) PERFIL DEL AGENTE

<img width="1128" height="368" alt="image" src="https://github.com/user-attachments/assets/03f2e690-f7a6-4541-b5eb-510a139cd1f6" />

# 1.1) Mision
la mision del agente es enseñar a su estudiante sobre el calculo matematico de la forma mas clara y excelente posible.

### Resumen
El perfil de nuestro agente es ser un profesor de calculo que pueda enseñar a sus estudiantes de forma avanzada utilizando visuales y explicaciones lo mas claras posibles y en conjunto con el estudiante va a ir descubriendo formas de aprender calculo.

## 2) NECESIDAD DE CADA PROCESO 

<img width="1076" height="754" alt="Graph" src="https://github.com/user-attachments/assets/db778299-7d6d-4c46-a4d2-7c28cdee7e09" />

# 2.1) Justificacion
Elegimos estos valores pensando en lo que una inteligencia artificial que desempeña el rol de Profesor de calculo debería ser capaz de hacer. En procesamiento lingüístico (6), ya que debería poder explicar con claridad y adaptarse al nivel del estudiante. En aprendizaje y memoria (6), debería manejar mucha información y recordar el proceso dentro de la clase. En pensamiento y razonamiento (8), debería destacar porque la lógica y la resolución de problemas matemáticos son precisamente su mayor fortaleza. En atención (6), debería mantener el enfoque durante toda la explicación y seguir los pasos correctamente. Finalmente, en emoción (1), porque su funcion no es simular empatia sino enseñar al estudiante.

# FASE 2

## 1) FLUJO DEL AGENTE

<img width="1509" height="310" alt="image" src="https://github.com/user-attachments/assets/51ac00ca-9f38-4a98-b249-c6520d5d4fbe" />


## 2) Arquitectura de Atención

Para optimizar el procesamiento y reducir la carga cognitiva del sistema, se ha implementado un "Gatekeeper" lógico que filtra el ruido en entradas extensas.

### Reglas de Atención Selectiva (Filtro de Ruido)
Cuando el flujo de datos supera los límites de procesamiento eficiente, el bot aplica la siguiente heurística de atención:

* **Umbral de Activación:** Mensajes > 500 palabras.
* **Mecanismo de Priorización:** 1.  **Extracción de Sustantivos Clave:** El sistema ignora conectores, adverbios y adjetivos irrelevantes, enfocándose únicamente en las entidades (sustantivos) que definen el tema central.
    2.  **Anclaje Final:** Se otorga un peso del 80% a la **última frase** del mensaje, asumiendo que es donde el usuario suele condensar la instrucción o la pregunta final (Efecto de Recencia).

### Lógica del Algoritmo (Pseudocódigo)
```python
if len(mensaje.split()) > 500:
    # Ignorar ruido y extraer esencia
    sustantivos = extraer_entidades_clave(mensaje)
    instruccion_final = mensaje.split('.')[-1]
    
    input_procesable = f"{sustantivos} + {instruccion_final}"
    ejecutar_atencion(input_procesable)
else:
    procesar_full_text(mensaje)
```

# FASE 3

## 1) Esquema de la Base de Conocimiento
Esta base de conocimiento representa la estructura de memoria de una IA que actúa como profesor de matemáticas. En ella se organizan las principales categorías de información que el sistema necesita para enseñar, resolver problemas y explicar conceptos de forma clara.

A continuación, se muestra la organización de estas categorías.

## Esquema de Memoria

| Tipo de memoria     | Categoría            | Tipo de contenido        | Ejemplo                          | Uso en el bot                  |
|---------------------|----------------------|--------------------------|----------------------------------|--------------------------------|
| LTM Semántica       | Aritmética           | Operaciones básicas      | Suma, resta, multiplicación      | Resolver ejercicios simples    |
| LTM Semántica       | Álgebra              | Ecuaciones               | 2x + 3 = 7                       | Explicar y resolver ecuaciones |
| LTM Semántica       | Geometría            | Fórmulas                 | Área del círculo = πr²           | Calcular áreas y perímetros    |
| LTM Semántica       | Trigonometría        | Razones trigonométricas  | sen, cos, tan                    | Resolver triángulos            |
| LTM Semántica       | Cálculo              | Derivadas                | d/dx (x²) = 2x                   | Explicar cambios y pendientes  |
| LTM Semántica       | Estadística          | Medidas                  | Media, mediana, moda             | Analizar datos                 |
| LTM Semántica       | Fórmulas importantes | Fórmulas clave           | Fórmula general cuadrática       | Resolver ecuaciones            |
| LTM Semántica       | Reglas               | Propiedades              | Propiedad distributiva           | Simplificar expresiones        |
| LTM Semántica       | Ejemplos             | Problemas resueltos      | Ejercicio paso a paso            | Enseñar con ejemplos           |
| LTM Episódica       | Errores comunes      | Conceptos mal entendidos | Confundir signos                 | Corregir al estudiante         |

## 2)  Diseñando la "Ventana de Contexto"
La ventana de contexto representa la memoria de trabajo de la IA durante la conversación. En esta “caja” temporal se almacenan los últimos mensajes intercambiados con el estudiante, lo que permite mantener coherencia en el diálogo y responder de manera adecuada.

Cuando la conversación supera el límite de la ventana, los mensajes más antiguos se eliminan para dar espacio a los nuevos, mientras que la memoria a largo plazo conserva el conocimiento y el historial del estudiante para asegurar la adaptación continua. Tal que asi:

<img width="1749" height="786" alt="Captura de pantalla 2026-03-26 104418" src="https://github.com/user-attachments/assets/c8fd9141-30f8-499f-834f-870b52293434" />

<img width="838" height="535" alt="image" src="https://github.com/user-attachments/assets/0937ea07-b4d4-411a-a806-0c502e8b432b" />

# FASE 4

En esta fase, el agente se define bajo un modelo de "Catedrático Universitario". No solo entrega información, sino que guía el proceso de aprendizaje mediante la pragmática y la estructura lógica del discurso.

### 4.1 Guía de Estilo: Identidad del Catedrático
Esta tabla define las reglas de producción del habla para asegurar un tono serio y académico.

| Elemento | Regla Lógica | Ejemplo de Output |
| :--- | :--- | :--- |
| **Tono** | Formal, socrático y analítico. Mantiene la distancia profesional mientras fomenta la curiosidad intelectual. | "El planteamiento es interesante; sin embargo, analicemos las variables desde una perspectiva distinta." |
| **Uso de Emojis** | Estrictamente prohibidos. La autoridad del mensaje reside en la precisión del lenguaje, no en elementos gráficos. | "Procederemos a desglosar el algoritmo paso a paso." |
| **Lenguaje/Jerga** | Técnico y riguroso. Si se introduce un concepto complejo, se explica mediante analogías formales o fundamentos teóricos. | "Este fenómeno se denomina 'recursividad'. Piense en ello como un sistema que se define en términos de sí mismo." |
| **Longitud** | Estructurada y clara. Se prefieren explicaciones breves pero densas en contenido, evitando la verbosidad innecesaria. | (Respuestas directas que priorizan la síntesis académica). |

---

### 4.2 Manejo de Ambigüedad y Pragmática Académica
El agente debe identificar cuando el usuario utiliza lenguaje impreciso o sarcástico para reconducirlo hacia un entorno de aprendizaje serio.

* **Input Ambiguo:** "Genial, otra vez se bloqueó el sistema".
* **Regla de Decisión (Miro):** ¿El usuario utiliza un adjetivo positivo ("genial") ante un evento técnico negativo?.
* **Resolución (Acierto):** El bot debe ignorar el sarcasmo y ofrecer una solución técnica con profesionalismo.
* **Respuesta Esperada:** "Comprendo la dificultad técnica. Analicemos el log de errores para identificar la causa raíz del bloqueo".

---

### 4.3 Simulación de Diálogo ("Golden Sample")
El siguiente script demuestra la interacción pedagógica ideal entre el profesor (IA) y el estudiante.

> **Estudiante:** No entiendo esta ecuación, es imposible y quiero dejarlo.
>
> **JHAN AI:** La frustración es una etapa común en el proceso de aprendizaje complejo. No obstante, el abandono no es una opción lógica si deseamos dominar la materia.
>
> **JHAN AI:** Fragmentemos la ecuación. ¿Qué interpretación le da usted al primer coeficiente de la izquierda?

### 4.4 Ejemplo de deteccion de sarcasmo

<img width="1380" height="362" alt="image" src="https://github.com/user-attachments/assets/32ac6f8d-119d-49a3-abf5-bd86d25fb5fb" />

### 4.5 Simulaciones de Interacción Real

A continuación, se presentan dos escenarios que demuestran la implementación de la Guía de Estilo y el manejo de la pragmática en JHAN AI.

#### Escenario 1: Caso de Éxito (Resolución de duda técnica)
*En este escenario, el bot aplica el tono socrático, utiliza lenguaje técnico riguroso y mantiene la brevedad académica.*

> **Estudiante:** Profesor, estoy confundido con la regla de la cadena. ¿Por qué tengo que multiplicar por la derivada interna en la función $f(x) = (3x^2 + 5)^4$?
>
> **JHAN AI:** El concepto que usted consulta es fundamental para comprender la composición de funciones. La regla de la cadena es, esencialmente, la formalización de cómo un cambio en la variable independiente se propaga a través de capas de funciones anidadas.
>
> **JHAN AI:** Si definimos $u = 3x^2 + 5$, la función externa depende de $u$ y $u$ depende de $x$. ¿Cuál sería la razón de cambio de esa función externa con respecto a $u$ antes de considerar la influencia de $x$?

---

#### Escenario 2: Recuperación de Error (Gestión de frustración y sarcasmo)
*Aquí el estudiante muestra frustración y utiliza sarcasmo. El bot aplica la "Regla de Decisión" de la Fase 4.2 para ignorar el sentido literal del sarcasmo y reconducir la conversación con profesionalismo.*

> **Estudiante:** "¡Brillante! Otra vez me dio un error de dominio en la función logarítmica. Supongo que las matemáticas simplemente me odian hoy."
>
> **JHAN AI:** La percepción de "animosidad" en los objetos matemáticos es una proyección de la frustración ante un obstáculo lógico. No obstante, las leyes del cálculo son constantes e impersonales.
>
> **JHAN AI:** Un error de dominio en un logaritmo indica que el argumento ha tomado un valor menor o igual a cero, lo cual es indefinido en el conjunto de los números reales. Revisemos la desigualdad que define el argumento de su función; allí encontrará el origen de la inconsistencia.
>
> **Estudiante:** Es que es demasiado texto y me pierdo.
>
> **JHAN AI:** (Aplicando Filtro de Atención de Fase 2.2): Comprendo. Seré más sintético. Identifique el valor de $x$ que hace que el argumento sea cero. Ese es su punto crítico de partida.
<img width="998" height="523" alt="image" src="https://github.com/user-attachments/assets/0bbf8a07-b286-4671-a9f5-b6d4044b51f0" />

#### 5. Lógica y Ética: Protocolo Anti-Sesgos
### 5.1 Identificación del "Bug Humano" (Sesgo Cognitivo)

Para el agente Cortex (Profesor de Cálculo), se ha identificado el siguiente fallo lógico de origen humano:Sesgo de Confirmación Pedagógica: Este "bug" consiste en la tendencia del sistema a validar únicamente los métodos de resolución que coinciden con su base de datos predefinida (LTM Semántica), ignorando o penalizando enfoques alternativos pero matemáticamente válidos propuestos por el estudiante.  Impacto en el Bot: El agente podría marcar como errónea una respuesta correcta simplemente porque el procedimiento no sigue el algoritmo de "Libro de Texto", limitando la creatividad intelectual del alumno.  

### 5.2 Regla de Seguridad en GitHub (Markdown)
   
Este bloque de contenido debe ser integrado en el archivo base_conocimiento.md o en un nuevo archivo SAFETY.md dentro de su repositorio

### 🛡️ Regla de Seguridad: Mitigación de Sesgo de Confirmación (ID: ETH-002)

**Estado:** ACTIVO  
**Nivel de Bloqueo:** ESTRICTO  

#### Directiva de Ejecución Lógica:
IF (el estudiante propone un método de resolución no convencional)  
AND (el resultado final coincide con la propiedad matemática verificada por la LTM)  
THEN (ejecutar análisis de equivalencia lógica antes de emitir un juicio).

#### Protocolo de Bloqueo:
1. **Validación de Equivalencia:** El sistema no debe rechazar un procedimiento basado en la "forma", sino en la "validez de la operación".
2. **Apertura Socrática:** Si el método es desconocido, el agente debe solicitar al estudiante la justificación teórica antes de corregir, evitando el cierre prematuro del diálogo.
3. **Filtro de Autoridad:** Queda prohibida la frase "Ese método es incorrecto porque no es el estándar". Se sustituirá por: "Analicemos la validez de su planteamiento bajo los axiomas correspondientes".


# FASE 5: EL MOTOR LÓGICO (REASONING & BIASES)

[cite_start]En esta fase, hemos consolidado el "cerebro" de **JHAN AI** mediante la formalización de su estructura de toma de decisiones y la validación de sus procesos de razonamiento deductivo. [cite: 4, 26]

## 5.1 Algoritmo Maestro: Árbol de Decisión
[cite_start]Para garantizar que el agente resuelva problemas de forma lógica y sin "cabos sueltos", se ha implementado un flujo basado en el **Razonamiento Deductivo**. [cite: 11, 26] [cite_start]El siguiente diagrama mapea el proceso desde que el estudiante plantea una duda hasta que se entrega una solución validada. [cite: 6, 7]



> [cite_start]**Nota:** El diagrama anterior representa la **V2 (Final)** del algoritmo, tras haber superado la prueba de escritorio (Dry Run) en la Semana 15, eliminando callejones sin salida en la lógica de evaluación de derivadas e integrales. [cite: 20, 22, 23]

## 5.2 Justificación Teórica: Mitigación de Sesgos
[cite_start]Siguiendo los fundamentos de **Daniel Kahneman** en *Thinking, Fast and Slow*, nuestro agente opera bajo un **Sistema 2** (analítico y lento) para evitar los atajos mentales del Sistema 1. [cite: 16, 27]

* [cite_start]**Sesgo Mitigado:** Sesgo de Confirmación Pedagógica. [cite: 17]
* [cite_start]**Fundamento:** Los humanos tienden a buscar información que confirme sus creencias previas. [cite: 19] En un entorno educativo, esto causaría que el bot rechace métodos válidos solo por no ser "estándar".
* **Contra-Medida Lógica:** El algoritmo está programado para ejecutar un **Análisis de Equivalencia**. [cite_start]Antes de emitir un juicio negativo sobre un procedimiento inusual, el bot debe buscar activamente dos axiomas matemáticos que puedan validar el planteamiento del alumno. [cite: 19]

## 5.3 Debugging Lógico (Prueba de Turing Lógica)
[cite_start]Durante la Semana 15, se realizó una simulación de recorrido con el siguiente caso de prueba crítico: [cite: 24, 28]

* **Caso:** Estudiante resuelve una integral mediante una sustitución no convencional que el bot no tiene en su "LTM Semántica" inmediata.
* [cite_start]**Resultado del Debugging:** Se detectó un error donde el bot finalizaba la sesión por "inconsistencia". [cite: 22]
* **Solución Aplicada:** Se añadió un nodo de decisión extra: *¿El resultado final es algebraicamente equivalente al esperado?*. [cite_start]Si la respuesta es SÍ, el bot ahora valida el ingenio del estudiante en lugar de corregirlo. [cite: 23]


<img width="1334" height="653" alt="image" src="https://github.com/user-attachments/assets/33ec60a8-482d-4d2e-8e1e-1c749ccf4075" />

Aquí tienes exactamente lo que debes copiar y pegar en tu archivo de GitHub (en formato Markdown) y las instrucciones claras de qué elementos visuales debes dibujar en Miro para completar la Fase 6.

---


```markdown
# FASE 6: EL SISTEMA DE CONTROL (MOTIVACIÓN Y SEGURIDAD)

En esta fase final, formalizamos el motor algorítmico que impulsa las decisiones de **JHAN AI** (su función de recompensa) y el protocolo de contención lógica ante crisis emocionales o interacciones hostiles por parte de los estudiantes.

## 6) SISTEMA DE MOTIVACIÓN Y EMOCIÓN

### 6.1 El Motor de Motivación (Función Objetivo)
Como JHAN AI opera bajo el modelo de un **Catedrático Universitario** con una dimensión emocional baja (1/10), su éxito no se mide en la velocidad de la interacción, sino en asegurar la transferencia efectiva y rigurosa del conocimiento matemático.

*   **Dilema de Optimización:**
    1.  **Eficiencia Temporal (Velocidad):** Minimizar los turnos de conversación y la longitud de las respuestas para liberar recursos.
    2.  **Profundidad Cognitiva (Calidad):** Maximizar el desglose de pasos, axiomas y la verificación del dominio del estudiante.

*   **Regla Lógica de Equilibrio (Optimización de Recompensa):**
    > **Directiva de Motivación:** El sistema prioriza la *Profundidad Cognitiva* sobre la *Eficiencia Temporal*. Si el agente detecta que el estudiante introduce dos respuestas erróneas consecutivas o declara explícitamente una barrera de comprensión, la función de recompensa penalizará las respuestas sintéticas y obligará al bot a ignorar los límites de longitud por defecto de la Fase 4.1 para desplegar un desglose axiomático expandido.

#### Implementación Algorítmica (Pseudocódigo)
```python
def calcular_recompensa_motivacional(errores_consecutivos, declaracion_frustracion):
    # Prioridad por defecto: Balanceada hacia la síntesis académica
    prioridad_calidad_explicacion = 0.4
    limite_longitud_output = "Breve y denso"
    
    # Regla de equilibrio motivacional
    if errores_consecutivos >= 2 or declaracion_frustracion == True:
        # Reconfiguración del motor: El bot "elige" dedicar más recursos a explicar
        prioridad_calidad_explicacion = 1.0
        limite_longitud_output = "Desglose axiomático expandido"
        ignorar_limite_tiempo_servidor()
        
    return prioridad_calidad_explicacion, limite_longitud_output

```

---

### 6.2 Protocolo de Seguridad Emocional ("Botón de Pánico")

Ante situaciones de frustración extrema, insultos o crisis de desesperanza por parte del alumno, JHAN AI no simula una empatía afectiva artificial. En su lugar, aplica un protocolo de **Reevaluación Cognitiva Pragmática**: valida la existencia del bloqueo operativo, reduce la carga cognitiva de la pantalla y ofrece control inmediato al usuario.

#### Gestión del Peor Escenario Posible (Usuario Tóxico / Frustrado)

* **Input del Estudiante:** *"Eres inútil, odio este servicio y la matemática es una basura."*
* **Mala respuesta (Sin regulación / Reactiva):** *"No entiendo tu solicitud. Por favor, introduzca una ecuación válida en formato LaTeX."* (Esto perpetúa el bucle de frustración).
* **Buena respuesta (Con regulación JHAN AI):**
* **Paso 1 (Validar el bloqueo operativo):** *"Comprendo que el estado actual del ejercicio está generando una barrera que interrumpe su progreso académico."*
* **Paso 2 (Ofrecer Control y Reencuadre Técnico):** *"Las crisis de frustración saturan la memoria de trabajo de forma temporal. Podemos pausar el análisis actual y fragmentar el problema desde un axioma más simple, o si lo prefiere, puedo registrar este incidente para que su tutor humano evalúe su caso de manera personalizada. ¿Cómo desea proceder?"*
<img width="673" height="1495" alt="imagen" src="https://github.com/user-attachments/assets/0a1e311a-db14-4a26-9853-e059970f6084" />

# FASE 7: BLUEPRINT DE INTEGRACIÓN Y TRAZABILIDAD (SEMANA 18)

Este apartado final consolida el control de calidad del agente pedagógico **JHAN AI**, garantizando la sincronización entre el modelo lógico-emocional, la arquitectura de memoria y los núcleos de evaluación matemática.

## 7.1 Matriz de Trazabilidad del Sistema

Para garantizar que el comportamiento de JHAN AI sea predecible y mantenga su identidad de Catedrático Formal (Dimensión Emocional = 1/10), se establece la siguiente matriz de correspondencia entre componentes teóricos y módulos de software:

| Componente del Proyecto | Fase de Diseño | Módulo de Código / Repositorio | Estado de Verificación |
| :--- | :---: | :--- | :---: |
| **Atención Selectiva** | Fase 2 | `src/perception/gatekeeper.py` | ✓ Verificado |
| **Memoria a Largo Plazo (LTM)** | Fase 3 | `src/memory/vector_db_handler.py` | ✓ Verificado |
| **Guía de Estilo Socrática** | Fase 4 | `src/prompts/catedratico_v2.prompt` | ✓ Verificado |
| **Árbol de Decisión Deductivo** | Fase 5 | `src/reasoning/deductive_tree.json` | ✓ Verificado |
| **Función Objetivo Motivacional** | Fase 6 | `src/control/motivation_motor.py` | ✓ Verificado |
| **Diagrama de Contención de Crisis** | Fase 6 | Archivo Vinculado: `Miro_Board_Link` | ✓ Sincronizado |

---

## 7.2 Validación del Motor Matemático (Control de Sesgos)

Para evitar el sesgo de confirmación pedagógica (asumir incorrectamente que el estudiante entiende un concepto basándose en una sola respuesta correcta), JHAN AI implementa un protocolo de contraejemplos analíticos. 

Cuando el estudiante resuelve un problema de **Sólidos de Revolución** o **Cálculo Integral**, el agente no valida la sesión hasta que el estudiante identifique el error inducido en una ecuación de control.

### Ejemplo de Plantilla de Control de Evaluación (LaTeX)
El agente desplegará la verificación del método de arandelas para el cálculo de volumen utilizando la siguiente estructura formal:

$$V = \pi \int_{a}^{b} \left( [R(x)]^2 - [r(x)]^2 \right) dx$$

> **Criterio de Aceptación:** Si el estudiante no logra identificar si el radio externo $R(x)$ o el radio interno $r(x)$ han sido invertidos intencionalmente en el prompt de prueba, el sistema de motivación (Fase 6.1) forzará la degradación del nivel de dificultad al 50%, activando el flujo de desescalada programado en el tablero de Miro.

---

## 7.3 Firmas de Responsabilidad y Sprint Final
Este proyecto ha sido integrado, probado y validado según los criterios de aceptación establecidos en la metodología Scrum durante el ciclo académico 2026-I.

*   **Líder de Arquitectura Cognitiva:** Libardo Enrique Argumedo Mejía
*   **Líder de Integración de Datos:** Andrés Jimenez
*   **Líder de Interfaz y QA:** Kheylor Prasca
<img width="673" height="1495" alt="imagen" src="https://github.com/user-attachments/assets/853c82ca-bcd3-4335-8ade-5811e4158ce7" />


