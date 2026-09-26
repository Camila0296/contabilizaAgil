const { calcularImpuestos } = require('../../utils/impuestosCalculator');

describe('utils/impuestosCalculator - calcularImpuestos', () => {
  test('calcula IVA 19% sin retenciones por defecto', () => {
    expect(calcularImpuestos(1000)).toEqual({ iva: 190, retefuente: 0, ica: 0, totalAPagar: 1190 });
  });

  test('descuenta retefuente e ICA del total', () => {
    const r = calcularImpuestos(1000000, 2.5, 0.966);
    expect(r.iva).toBe(190000);
    expect(r.retefuente).toBe(25000);
    expect(r.ica).toBe(9660);
    expect(r.totalAPagar).toBe(1000000 + 190000 - 25000 - 9660);
  });

  test('trata porcentajes null/undefined como 0', () => {
    expect(calcularImpuestos(500, null, undefined)).toEqual({ iva: 95, retefuente: 0, ica: 0, totalAPagar: 595 });
  });

  test('monto 0 produce todos los valores en 0', () => {
    expect(calcularImpuestos(0, 10, 10)).toEqual({ iva: 0, retefuente: 0, ica: 0, totalAPagar: 0 });
  });

  test('redondea a 2 decimales con montos decimales', () => {
    const r = calcularImpuestos(123.45, 3.5, 1.1);
    expect(r.iva).toBe(23.46);
    expect(r.retefuente).toBe(4.32);
    expect(r.ica).toBe(1.36);
    expect(r.totalAPagar).toBe(+(123.45 + 23.46 - 4.32 - 1.36).toFixed(2));
  });

  test('montos negativos (notas crédito) mantienen el signo', () => {
    const r = calcularImpuestos(-1000, 0, 0);
    expect(r.iva).toBe(-190);
    expect(r.totalAPagar).toBe(-1190);
  });
});
