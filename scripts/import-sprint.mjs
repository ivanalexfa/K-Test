import fs from 'node:fs';
import path from 'node:path';

/**
 * Splits prose text into lines of ~10-12 words with line numbering
 * and paragraph start markers, matching the PAA exam format.
 */
export function formatPassageLines(rawText) {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const lines = [];
  let currentLineNumber = 1;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let lineWords = [];
    let isParaStart = true;

    for (let i = 0; i < words.length; i++) {
      lineWords.push(words[i]);
      // Wrap line every 10-12 words or at paragraph end
      if (lineWords.length >= 11 || i === words.length - 1) {
        lines.push({
          lineNumber: currentLineNumber++,
          text: lineWords.join(' '),
          ...(isParaStart ? { isParagraphStart: true } : {}),
        });
        lineWords = [];
        isParaStart = false;
      }
    }
  }

  return lines;
}

/**
 * Parses raw text template for adding sprints
 */
export function parseSprintTemplate(rawInput) {
  const input = rawInput.replace(/\r\n/g, '\n').trim();

  const isMath = /MATEM[ÁA]TICAS/i.test(input) || /sprint-math/i.test(input) || /SPRINT M-/i.test(input);
  const section = isMath ? 'math' : 'reading';
  const mode = isMath ? 'sprint_math' : 'sprint_reading';

  // Extract Sprint metadata
  const codeMatch = input.match(/C[óo]digo:\s*([^\n]+)/i);
  const titleMatch = input.match(/T[íi]tulo:\s*([^\n]+)/i);
  const diffMatch = input.match(/Dificultad:\s*([^\n]+)/i);
  const durMatch = input.match(/Duraci[óo]n:\s*(\d+)/i);
  const descMatch = input.match(/Descripci[óo]n:\s*([^\n]+)/i);
  const topicsMatch = input.match(/Temas:\s*([^\n]+)/i);

  const code = codeMatch ? codeMatch[1].trim() : (isMath ? 'SPRINT M-XX' : 'SPRINT L-XX');
  const title = titleMatch ? titleMatch[1].trim() : 'Nuevo Sprint de Práctica';
  const rawDiff = diffMatch ? diffMatch[1].trim().toLowerCase() : 'intermedio';
  const difficulty = rawDiff.includes('avanzad') ? 'Avanzado' : (rawDiff.includes('b[aá]sic') ? 'Básico' : 'Intermedio');
  const durationMinutes = durMatch ? parseInt(durMatch[1], 10) : (isMath ? 4 : 5);
  const description = descMatch ? descMatch[1].trim() : 'Entrenamiento enfocado en habilidades PAA.';
  const topics = topicsMatch
    ? topicsMatch[1].split(/[,;]/).map((t) => t.trim()).filter(Boolean)
    : [isMath ? 'Matemáticas' : 'Lectura y Redacción'];

  // Extract Passage (only for reading if present)
  let passageData = null;
  const passageBlockMatch = input.match(/=== NUEVA LECTURA \/ PASAJE ===([\s\S]*?)(?=--- PREGUNTA|$)/i);
  if (passageBlockMatch && !isMath) {
    const pBlock = passageBlockMatch[1];
    const pTitleMatch = pBlock.match(/T[íi]tulo del Texto:\s*([^\n]+)/i);
    const pSourceMatch = pBlock.match(/Fuente \/ Autor:\s*([^\n]+)/i);
    const pPreambleMatch = pBlock.match(/Pre[áa]mbulo:\s*([^\n]+)/i);
    const pTagMatch = pBlock.match(/Etiqueta Tem[áa]tica:\s*([^\n]+)/i);
    const pTextMatch = pBlock.match(/Texto Completo:\s*([\s\S]*?)$/i);

    if (pTextMatch && pTextMatch[1].trim()) {
      passageData = {
        title: pTitleMatch ? pTitleMatch[1].trim() : 'Texto de Lectura',
        authorOrSource: pSourceMatch ? pSourceMatch[1].trim() : 'Fuente Académica',
        preamble: pPreambleMatch ? pPreambleMatch[1].trim() : 'Lee con atención el siguiente fragmento.',
        tag: pTagMatch ? pTagMatch[1].trim() : 'Comprensión Lectora',
        rawText: pTextMatch[1].trim(),
      };
    }
  }

  // Extract Questions
  const questionBlocks = input.split(/--- PREGUNTA \d+ ---/i).slice(1);
  const questions = [];

  for (const qBlock of questionBlocks) {
    const catMatch = qBlock.match(/Categor[íi]a:\s*([^\n]+)/i);
    const linesMatch = qBlock.match(/L[íi]neas Referenciadas[^:]*:\s*([^\n]+)/i);
    const promptMatch = qBlock.match(/Enunciado:\s*([\s\S]*?)(?=(?:F[óo]rmula|Opci[óo]n A:|$))/i);
    const formulaMatch = qBlock.match(/F[óo]rmula\/Bloque Destacado[^:]*:\s*([^\n]+)/i);
    const optAMatch = qBlock.match(/Opci[óo]n A:\s*([^\n]+)/i);
    const optBMatch = qBlock.match(/Opci[óo]n B:\s*([^\n]+)/i);
    const optCMatch = qBlock.match(/Opci[óo]n C:\s*([^\n]+)/i);
    const optDMatch = qBlock.match(/Opci[óo]n D:\s*([^\n]+)/i);
    const correctMatch = qBlock.match(/Opci[óo]n Correcta:\s*([ABCD])/i);
    const justMatch = qBlock.match(/Justificaci[óo]n[^:]*:\s*([\s\S]*?)$/i);

    if (promptMatch && optAMatch && optBMatch) {
      // Parse referenced line numbers if any (e.g. "Líneas 8–10" or "8, 9, 10")
      let refLines = [];
      let refLabel = '';
      if (linesMatch && linesMatch[1].trim()) {
        refLabel = linesMatch[1].trim();
        const numMatches = refLabel.match(/\d+/g);
        if (numMatches) {
          const start = parseInt(numMatches[0], 10);
          const end = numMatches.length > 1 ? parseInt(numMatches[1], 10) : start;
          for (let n = Math.min(start, end); n <= Math.max(start, end); n++) {
            refLines.push(n);
          }
        }
      }

      questions.push({
        category: catMatch ? catMatch[1].trim() : (isMath ? 'Razonamiento Matemático' : 'Comprensión Lectora'),
        referencedLines: refLines.length > 0 ? refLines : undefined,
        referencedLinesLabel: refLabel || undefined,
        prompt: promptMatch[1].trim(),
        mathEquationBlock: formulaMatch ? formulaMatch[1].trim() : undefined,
        options: [
          { id: 'A', text: optAMatch ? optAMatch[1].trim() : '' },
          { id: 'B', text: optBMatch ? optBMatch[1].trim() : '' },
          { id: 'C', text: optCMatch ? optCMatch[1].trim() : '' },
          { id: 'D', text: optDMatch ? optDMatch[1].trim() : '' },
        ],
        correctOption: correctMatch ? correctMatch[1].toUpperCase() : 'A',
        explanation: justMatch ? justMatch[1].trim() : 'Solución oficial del reactivo.',
      });
    }
  }

  return {
    section,
    mode,
    code,
    title,
    difficulty,
    durationMinutes,
    description,
    topics,
    passageData,
    questions,
  };
}

/**
 * Inserts parsed sprint into mockPaaExam.json and sprintsCatalog.ts
 */
export function insertSprint(parsed) {
  const examPath = path.resolve('src/data/mockPaaExam.json');
  const catalogPath = path.resolve('src/data/sprintsCatalog.ts');

  const examData = JSON.parse(fs.readFileSync(examPath, 'utf8'));

  // 1. Insert passage if present
  let assignedPassageId = null;
  if (parsed.passageData) {
    const existingPassageKeys = Object.keys(examData.passages || {});
    let maxPassageNum = 0;
    for (const key of existingPassageKeys) {
      const match = key.match(/passage-(\d+)/);
      if (match) maxPassageNum = Math.max(maxPassageNum, parseInt(match[1], 10));
    }
    assignedPassageId = `passage-${maxPassageNum + 1}`;

    examData.passages[assignedPassageId] = {
      id: assignedPassageId,
      title: parsed.passageData.title,
      authorOrSource: parsed.passageData.authorOrSource,
      preamble: parsed.passageData.preamble,
      tag: parsed.passageData.tag,
      lines: formatPassageLines(parsed.passageData.rawText),
    };
  }

  // 2. Insert questions
  const sectionQuestions = examData.sections[parsed.section].questions;
  let maxQNum = 0;
  const prefix = parsed.section === 'math' ? 'math' : 'read';

  for (const q of sectionQuestions) {
    const match = q.id.match(new RegExp(`^${prefix}-(\\d+)`));
    if (match) maxQNum = Math.max(maxQNum, parseInt(match[1], 10));
  }

  const assignedQuestionIds = [];

  for (let i = 0; i < parsed.questions.length; i++) {
    const nextNum = maxQNum + 1 + i;
    const qId = `${prefix}-${nextNum}`;
    assignedQuestionIds.push(qId);

    const qObj = {
      id: qId,
      numberInSection: sectionQuestions.length + 1,
      section: parsed.section,
      category: parsed.questions[i].category,
      ...(assignedPassageId ? { passageId: assignedPassageId } : {}),
      ...(parsed.questions[i].referencedLines ? { referencedLines: parsed.questions[i].referencedLines } : {}),
      ...(parsed.questions[i].referencedLinesLabel ? { referencedLinesLabel: parsed.questions[i].referencedLinesLabel } : {}),
      prompt: parsed.questions[i].prompt,
      ...(parsed.questions[i].mathEquationBlock ? { mathEquationBlock: parsed.questions[i].mathEquationBlock } : {}),
      options: parsed.questions[i].options,
      correctOption: parsed.questions[i].correctOption,
      explanation: parsed.questions[i].explanation,
    };

    sectionQuestions.push(qObj);
  }

  // Save updated exam JSON
  fs.writeFileSync(examPath, JSON.stringify(examData, null, 2) + '\n', 'utf8');

  // 3. Insert sprint into sprintsCatalog.ts
  let catalogContent = fs.readFileSync(catalogPath, 'utf8');
  let sprintIdNum = 1;
  const existingSprintMatches = catalogContent.match(/sprint-(?:math|read)-(\d+)/g) || [];
  for (const m of existingSprintMatches) {
    const num = parseInt(m.split('-').pop(), 10);
    if (!isNaN(num)) sprintIdNum = Math.max(sprintIdNum, num + 1);
  }

  const sprintId = `sprint-${prefix}-${sprintIdNum}`;

  const newSprintEntry = `  {
    id: '${sprintId}',
    code: '${parsed.code.replace(/'/g, "\\'")}',
    title: '${parsed.title.replace(/'/g, "\\'")}',
    section: '${parsed.section}',
    mode: '${parsed.mode}',
    durationMinutes: ${parsed.durationMinutes},
    difficulty: '${parsed.difficulty}',
    description:
      '${parsed.description.replace(/'/g, "\\'")}',
    topics: ${JSON.stringify(parsed.topics)},
    questionIds: ${JSON.stringify(assignedQuestionIds)},
  },`;

  // Insert before closing bracket of SPRINTS_CATALOG
  const lastBracketIndex = catalogContent.lastIndexOf('];');
  if (lastBracketIndex !== -1) {
    catalogContent =
      catalogContent.slice(0, lastBracketIndex) +
      newSprintEntry +
      '\n];\n';
  }

  fs.writeFileSync(catalogPath, catalogContent, 'utf8');

  return {
    sprintId,
    code: parsed.code,
    title: parsed.title,
    section: parsed.section,
    passageId: assignedPassageId,
    questionIds: assignedQuestionIds,
  };
}

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('import-sprint.mjs')) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: node scripts/import-sprint.mjs <archivo-plantilla.txt>');
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = parseSprintTemplate(text);
  const result = insertSprint(parsed);
  console.log('✓ Sprint importado exitosamente:', result);
}
