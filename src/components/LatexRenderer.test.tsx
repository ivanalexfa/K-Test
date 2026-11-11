import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { LatexRenderer } from './LatexRenderer';

describe('LatexRenderer', () => {
  it('convierte la fórmula en línea con KaTeX y deja el texto normal', () => {
    const { container } = render(<LatexRenderer content="El área es $\pi r^2$ unidades" />);

    expect(container.querySelector('.katex')).not.toBeNull();
    expect(container).toHaveTextContent('El área es');
    expect(container).toHaveTextContent('unidades');
  });

  it('respeta los saltos de línea del texto', () => {
    const { container } = render(<LatexRenderer content={'Línea uno\nLínea dos'} />);

    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  it('no dibuja nada si no hay contenido', () => {
    const { container } = render(<LatexRenderer content="" />);

    expect(container.textContent).toBe('');
  });
});
