import { SprintConfig } from '../types/exam';

export const SPRINTS_CATALOG: SprintConfig[] = [
  // ================= SPRINTS DE LECTURA Y REDACCIÓN =================
  {
    id: 'sprint-read-1',
    code: 'SPRINT L-01',
    title: 'Comprensión Científica: Vocabulario en Contexto e Inferencia',
    section: 'reading',
    mode: 'sprint_reading',
    durationMinutes: 4,
    difficulty: 'Intermedio',
    description:
      'Analiza el pasaje sobre arquitectura de nanosatélites CubeSat, identificando sentido contextual y estructura argumentativa por líneas citadas.',
    topics: ['Vocabulario en Contexto', 'Inferencia Científica', 'Estructura Textual'],
    questionIds: ['read-1', 'read-2', 'read-3'],
  },
  {
    id: 'sprint-read-2',
    code: 'SPRINT L-02',
    title: 'Redacción Indirecta: Concisión, Normativa y Conectores',
    section: 'reading',
    mode: 'sprint_reading',
    durationMinutes: 3,
    difficulty: 'Intermedio',
    description:
      'Evalúa la economía verbal, eliminación de giros perifrásticos redundantes y el uso preciso de conectores adversativos en textos de ingeniería.',
    topics: ['Economía Verbal', 'Corrección Normativa', 'Cohesión y Conectores'],
    questionIds: ['read-4', 'read-5'],
  },
  {
    id: 'sprint-read-3',
    code: 'SPRINT L-03',
    title: 'Sprint Integral de Lectura y Redacción PAA',
    section: 'reading',
    mode: 'sprint_reading',
    durationMinutes: 6,
    difficulty: 'Avanzado',
    description:
      'Entrenamiento cronometrado que combina los dos pasajes completos (comprensión lectora y redacción indirecta) bajo presión de tiempo real.',
    topics: ['Lectura Crítica', 'Redacción Indirecta', 'Citas de Líneas'],
    questionIds: ['read-1', 'read-2', 'read-3', 'read-4', 'read-5'],
  },

  // ================= SPRINTS DE MATEMÁTICAS =================
  {
    id: 'sprint-math-1',
    code: 'SPRINT M-01',
    title: 'Geometría Espacial, Volúmenes y Triángulos Especiales',
    section: 'math',
    mode: 'sprint_math',
    durationMinutes: 4,
    difficulty: 'Intermedio',
    description:
      'Problemas enfocados en cilindros, conos, triángulos notables 30°-60°-90° y figuras inscritas usando la hoja de fórmulas geométricas PAA.',
    topics: ['Volúmenes 3D', 'Triángulos 30°-60°-90°', 'Áreas Sombreadas'],
    questionIds: ['math-1', 'math-2', 'math-5'],
  },
  {
    id: 'sprint-math-2',
    code: 'SPRINT M-02',
    title: 'Álgebra Estratégica: Sistemas y Modelos Cuadráticos',
    section: 'math',
    mode: 'sprint_math',
    durationMinutes: 3,
    difficulty: 'Básico',
    description:
      'Resolución ágil de sistemas lineales por diferencia de cuadrados y optimización de máximos/mínimos en funciones cuadráticas.',
    topics: ['Diferencia de Cuadrados', 'Sistemas Lineales', 'Parábola y Vértice'],
    questionIds: ['math-3', 'math-4'],
  },
  {
    id: 'sprint-math-3',
    code: 'SPRINT M-03',
    title: 'Sprint Integral de Razonamiento Matemático PAA',
    section: 'math',
    mode: 'sprint_math',
    durationMinutes: 6,
    difficulty: 'Avanzado',
    description:
      'Batería completa de los 5 problemas cuantitativos (geometría, álgebra y funciones) para medir velocidad y precisión matemática.',
    topics: ['Geometría PAA', 'Álgebra', 'Funciones'],
    questionIds: ['math-1', 'math-2', 'math-3', 'math-4', 'math-5'],
  },
];
