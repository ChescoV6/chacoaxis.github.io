import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from './analytics';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('track', () => {
  it('chama o gtag com o nome e os parâmetros', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    track('pdf_export_click', { locked: false });
    expect(gtag).toHaveBeenCalledWith('event', 'pdf_export_click', { locked: false });
  });

  it('sem gtag (bloqueador de anúncios) não faz nada e não quebra', () => {
    vi.stubGlobal('window', {});
    expect(() => track('premium_report_view')).not.toThrow();
  });

  it('se o gtag falhar, a tela não quebra', () => {
    vi.stubGlobal('window', {
      gtag: () => {
        throw new Error('bloqueado');
      }
    });
    expect(() => track('pdf_export_click')).not.toThrow();
  });
});
