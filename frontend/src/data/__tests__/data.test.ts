import pucAccounts from '../pucAccounts';
import { retefuenteOptions, icaOptions } from '../withholdingOptions';
import { retentionGuide, icaGuide, getRecommendedRetention } from '../retentionGuide';

describe('data/pucAccounts', () => {
  test('los códigos son únicos, numéricos y de 4 o 6 dígitos', () => {
    const codigos = pucAccounts.map(a => a.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
    codigos.forEach(c => expect(c).toMatch(/^\d{4}(\d{2})?$/));
  });

  test('todas tienen nombre y una naturaleza válida', () => {
    pucAccounts.forEach(a => {
      expect(a.nombre.trim()).not.toBe('');
      expect(['Débito', 'Crédito', 'Debito', 'Credito']).toContain(a.naturaleza);
    });
  });
});

describe('data/withholdingOptions', () => {
  test.each([
    ['retefuente', retefuenteOptions],
    ['ica', icaOptions],
  ])('%s: incluye 0%%, valores entre 0 y 100 y la etiqueta muestra el mismo porcentaje', (_n, options) => {
    expect(options[0].value).toBe(0);
    options.forEach(o => {
      expect(o.value).toBeGreaterThanOrEqual(0);
      expect(o.value).toBeLessThanOrEqual(100);
      expect(o.label).toMatch(new RegExp(`${String(o.value).replace('.', '\\.')}%`));
    });
  });

  test('las etiquetas no se repiten', () => {
    [retefuenteOptions, icaOptions].forEach(options => {
      const labels = options.map(o => o.label);
      expect(new Set(labels).size).toBe(labels.length);
    });
  });
});

describe('data/retentionGuide', () => {
  test('la guía de retenciones tiene categorías con tarifas en porcentaje', () => {
    expect(retentionGuide.length).toBeGreaterThan(0);
    retentionGuide.forEach(cat => {
      expect(cat.items.length).toBeGreaterThan(0);
      cat.items.forEach(i => expect(i.rate).toMatch(/^\d+(\.\d+)?%$/));
    });
  });

  test('la guía de ICA tiene tarifas y actividades', () => {
    icaGuide.forEach(g => {
      expect(g.rate).toMatch(/%/);
      expect(g.activities.length).toBeGreaterThan(0);
    });
  });

  describe('getRecommendedRetention', () => {
    test.each([
      ['Honorarios abogado', 11],
      ['Licencia de software', 3.5],
      ['Servicios de vigilancia', 2],
      ['Servicios de salud', 2],
      ['Servicios temporales', 1],
      ['Servicios de contador', 11],
      ['Arriendo muebles de oficina', 4],
      ['Arriendo local', 3.5],
      ['Compra de vehículo', 1],
      ['Compra con tarjeta', 1.5],
      ['Compra de café', 0.5],
      ['Compra de mercancía', 2.5],
      ['Servicio de consultoría', 4],
      ['GASOLINA', 0.1],
    ])('"%s" → %p%%', (texto, esperado) => {
      expect(getRecommendedRetention(texto)).toBe(esperado);
    });

    test.each(['Cobranza de cartera', 'Motivación del equipo', 'Autorización especial'])(
      'no confunde palabras que solo contienen una clave (%s)', (texto) => {
        expect(getRecommendedRetention(texto)).toBeNull();
      });

    test('devuelve null si no hay coincidencias', () => {
      expect(getRecommendedRetention('xyz')).toBeNull();
      expect(getRecommendedRetention('')).toBeNull();
    });
  });
});
