# proyecto-cortex-grupo-1-Profesor de matematicas 

## participantes
Castro Jimenez Andrés David<br>
Argumedo Mejia Libardo Enrique<br>
Prasca Pedraza Kheylor Daniel<br>

[enlace colaborativo de miro](https://miro.com/welcomeonboard/Y0FLRzVCOXE5Z3pOYTUyMFliaXhEdnptUXkxRzhiWlFtVStXejRkQTZNcDdCUHZ5UytsT0xwblFoTUpzTWtRYXFsWGVjMm51NVNzNC82eVJFdU5qd0tFMFVlb2ZPVE9TMkUyT0M4eG02eDlJcklIcDBIRFVDb1ExVkkyNG1oTzRNakdSWkpBejJWRjJhRnhhb1UwcS9BPT0hdjE=?share_link_id=424295732256)


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

