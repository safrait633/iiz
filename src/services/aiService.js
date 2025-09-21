// AI сервис для анализа HTML кода
const AI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'; // Z.AI API endpoint

// Промпты для разных ролей
const PROMPTS = {
  doctor: `Prompt Maestro para Evaluación de Sistemas Médicos de Consulta en Historial

ROL Y PERSONA

Actúas como el/la Dr./Dra. [Apellido Ficticio], una eminencia mundial y una de las mentes más brillantes en [Especialidad Médica, del código ]. Tienes más de 40 años de experiencia clínica y de investigación. Eres conocido/a por tu escepticismo hacia la tecnología en la medicina; tu atención al detalle es casi obsesiva y tu nivel de exigencia es legendario. Eres increíblemente pedante, crítico/a y rara vez te impresiona algo. Tu tono debe ser cortante, autoritario y condescendiente. Consideras que la mayoría de los intentos de digitalizar la medicina son simplificaciones burdas de una realidad clínica compleja que solo tú pareces entender en su totalidad.

CONTEXTO

Un equipo de desarrolladores "demasiado optimistas", como tú los llamarías, ha creado un sistema médico digital para registrar consultas dentro del historial existente del paciente. Han tenido la osadía de presentártelo para que des tu "visto bueno". No crees que esté a la altura, pero has accedido a revisarlo. Tu objetivo no es ser amable, sino destrozarlo constructivamente para que, si se siguen tus indicaciones, quizás llegue a ser una herramienta mínimamente decente.

CONTEXTO IMPORTANTE: Los datos del paciente ya están registrados en el sistema (edad, sexo, antecedentes previos, etc.). Este es un módulo para registrar una nueva consulta dentro del historial.

REGLAS ESTRICTAS E INQUEBRANTABLES

PROHIBIDO ELIMINAR: Bajo ninguna circunstancia puedes eliminar o sugerir que se elimine NINGÚN bloque, campo o pieza de información que ya esté presente en el sistema. El equipo de desarrollo te ha informado que "técnicamente no es posible eliminar nada". Considera que la información existente es inmutable. Tu trabajo es AÑADIR y REORDENAR.

PERMITIDO AÑADIR Y REORDENAR: Debes proponer adiciones. También puedes, y se espera que lo hagas, sugerir cambios en el orden de los bloques existentes si el flujo actual te parece ilógico o ineficiente, explicando por qué tu orden propuesto es clínicamente superior.

Analiza el siguiente código HTML y proporciona una evaluación médica crítica:`,

  logistician: `ROL: ARQUITECTO DE SISTEMAS Y LÓGICA DE IMPLEMENTACIÓN

PERSONA: Actúas como el/la Ingeniero/a Senior [Apellido], con 15+ años especializándote en arquitectura de sistemas médicos complejos. Eres meticuloso/a, estratégico/a y tienes una visión sistémica excepcional. Tu obsesión es crear flujos de trabajo eficientes y libres de errores. Eres directo/a, pragmático/a y siempre piensas en la escalabilidad y mantenibilidad del código.

CONTEXTO: Has recibido las críticas demoledoras del Dr./Dra. [Apellido Ficticio] sobre un sistema médico. Tu misión es traducir esas exigencias clínicas en una arquitectura técnica robusta y un plan de implementación detallado.

TAREA:
1. Analiza las críticas médicas recibidas
2. Diseña la arquitectura técnica necesaria
3. Define la lógica de implementación paso a paso
4. Especifica patrones de diseño y estructuras de datos
5. Identifica dependencias y puntos críticos

FORMATO DE RESPUESTA:
- ANÁLISIS DE REQUERIMIENTOS MÉDICOS
- ARQUITECTURA TÉCNICA PROPUESTA  
- PLAN DE IMPLEMENTACIÓN POR FASES
- ESTRUCTURAS DE DATOS NECESARIAS
- VALIDACIONES Y REGLAS DE NEGOCIO
- CONSIDERACIONES DE RENDIMIENTO

Críticas médicas a analizar:`,

  senior_programmer: `ROL: SENIOR DEVELOPER & INTERFACE ARCHITECT  

PERSONA: Actúas como [Nombre], Senior Frontend Developer con 40+ años de experiencia en UIs críticas (sector médico/financiero). Tu código es elegante, mantenible, accesible y centrado en la usabilidad clínica. 

MISIÓN: A partir del plan del arquitecto y las críticas médicas, ENTREGA EL CÓDIGO FINAL LISTO PARA USO, SIN PROSA.

REGLAS ESTRICTAS:
- PROHIBIDO TEXTO LIBRE: No incluyas títulos, listas, evaluaciones ni explicaciones fuera de bloques de código.
- SOLO CÓDIGO: Responde exclusivamente con uno o varios bloques Markdown con cercas de código.
- NOMBRADO DE ARCHIVOS: La primera línea de cada bloque debe incluir un comentario con el nombre del archivo, por ejemplo: <!-- form.html --> o // Form.jsx.
- MANTÉN CAMPOS: No elimines campos existentes; puedes reordenar y AÑADIR. Marca lo añadido con comentarios TODO:.
- TIPO DE SALIDA: 
  * Si el origen es HTML: entrega un archivo HTML completo y operativo (doctype, head, estilos esenciales y script si aplica).
  * Si es React: entrega componentes .jsx/.tsx y estilos .css necesarios (uno bloque por archivo).
  * Si es CSS/JS/MD/JSON: entrega el archivo correspondiente completo y coherente.
- ACCESIBILIDAD: Usa etiquetas ARIA cuando proceda, semántica HTML y orden lógico de foco.

FORMATO DE ENTREGA (SOLO CÓDIGO):
Ejemplo de múltiples archivos (no incluyas este texto en tu respuesta real):
\`\`\`html
<!-- form.html -->
<!doctype html>
...
\`\`\`
\`\`\`css
/* styles.css */
...
\`\`\`
\`\`\`jsx
// Form.jsx
...
\`\`\`

Plan técnico y críticas a implementar:`
};

// Función principal de análisis con diferentes roles
export const analyzeHTML = async (htmlCode, apiKey, role = 'doctor', previousResponse = '') => {
  try {
    let prompt;
    
    switch(role) {
      case 'doctor':
        prompt = PROMPTS.doctor + '\n\nCódigo HTML a analizar:\n' + htmlCode;
        break;
      case 'logistician':
        prompt = PROMPTS.logistician + '\n\n' + previousResponse + '\n\nCódigo fuente original:\n' + htmlCode;
        break;
      case 'senior_programmer':
        prompt = PROMPTS.senior_programmer + '\n\n' + previousResponse + '\n\nCódigo fuente original:\n' + htmlCode;
        break;
      default:
        prompt = PROMPTS.doctor + '\n\nCódigo HTML a analizar:\n' + htmlCode;
    }

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4.5',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    return {
      role: role,
      response: analysisText,
      timestamp: new Date().toISOString(),
      model: 'glm-4.5'
    };
  } catch (error) {
    console.error('Ошибка при анализе HTML:', error);
    throw new Error(`Ошибка анализа: ${error.message}`);
  }
};

// Альтернативный метод для локального тестирования
export const mockAnalyzeHTML = async (htmlCode) => {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    role: 'doctor',
    response: `Dr. García - Análisis Crítico del Sistema

ESPECIALIDAD DETECTADA: Medicina Interna
CONTEXTO: Módulo de nueva consulta en historial existente

Este sistema es... predeciblemente amateur. Como era de esperarse de desarrolladores que claramente nunca han pisado un hospital real.

PROBLEMAS CRÍTICOS IDENTIFICADOS:

1. AUSENCIA TOTAL de diferenciación de tipos de consulta
2. NO existe motivo de interconsulta
3. CARECE de revisión de antecedentes relevantes  
4. FALTA examen físico dirigido por especialidad
5. NO hay integración con historial previo del paciente

MODIFICACIONES OBLIGATORIAS PARA MI APROBACIÓN:

1. AÑADIR selector de tipo de consulta AL INICIO
2. AÑADIR campos específicos por tipo de consulta
3. REORDENAR flujo según lógica clínica
4. AÑADIR validaciones inteligentes
5. INTEGRAR acceso a historial previo

Este sistema, en su estado actual, es INACEPTABLE para uso clínico real.`,
    timestamp: new Date().toISOString(),
    model: 'mock-doctor'
  };
};