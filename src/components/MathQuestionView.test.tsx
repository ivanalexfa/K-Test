import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MathQuestionView } from './MathQuestionView';
import type { ExamQuestion } from '../types/exam';

function pregunta(id: string): ExamQuestion {
  return {
    id,
    numberInSection: 1,
    section: 'math',
    category: 'Álgebra',
    prompt: 'Si $x + 2 = 5$, ¿cuánto vale $x$?',
    options: [
      { id: 'A', text: '$1$' },
      { id: 'B', text: '$2$' },
      { id: 'C', text: '$3$' },
      { id: 'D', text: '$4$' },
    ],
    correctOption: 'C',
    explanation: 'Restando 2 de ambos lados, $x = 3$.',
  };
}

const props = {
  isFlagged: false,
  onSelectOption: vi.fn(),
  onToggleFlag: vi.fn(),
  onOpenFormulaModal: vi.fn(),
};

describe('MathQuestionView', () => {
  it('marca la opción elegida', async () => {
    const onSelectOption = vi.fn();
    render(<MathQuestionView {...props} question={pregunta('m-1')} onSelectOption={onSelectOption} />);

    await userEvent.click(screen.getAllByRole('radio')[2]);

    expect(onSelectOption).toHaveBeenCalledWith('C');
  });

  it('limpia las opciones tachadas al pasar a otra pregunta', async () => {
    const { rerender } = render(<MathQuestionView {...props} question={pregunta('m-1')} />);

    await userEvent.click(screen.getByRole('button', { name: 'Descartar opción A' }));
    expect(screen.getByRole('button', { name: 'Restaurar opción A' })).toBeInTheDocument();

    rerender(<MathQuestionView {...props} question={pregunta('m-2')} />);

    expect(screen.getByRole('button', { name: 'Descartar opción A' })).toBeInTheDocument();
  });
});
