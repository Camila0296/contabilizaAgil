import { exportarPDF, exportarExcel } from '../export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

jest.mock('jspdf', () => {
  const instance = { setFontSize: jest.fn(), text: jest.fn(), addPage: jest.fn(), save: jest.fn() };
  return { __esModule: true, default: jest.fn(() => instance) };
});
jest.mock('jspdf-autotable', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

const reporte = (overrides = {}) => ({
  totalFacturas: 2, totalMonto: 3000, totalIva: 570, totalReteFuente: 60, totalIca: 30,
  facturasPorMes: [{ mes: '2026-03', cantidad: 2, monto: 3000 }],
  topProveedores: [{ proveedor: 'ACME', cantidad: 2, monto: 3000 }],
  facturasRecientes: [{
    _id: '1', numero: 'F-1', fecha: '2026-03-01', proveedor: 'ACME', monto: 1000, puc: '5105',
    detalle: 'x', naturaleza: 'debito' as const, impuestos: { iva: 190, retefuente: 20, ica: 10 },
  }],
  ...overrides,
});

const pdf = () => (jsPDF as unknown as jest.Mock).mock.results[0].value;

describe('utils/export', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('exportarPDF', () => {
    test('genera resumen y una página por tabla con datos', () => {
      exportarPDF(reporte(), '2026-03');
      const doc = pdf();
      expect(doc.text).toHaveBeenCalledWith('Período: 2026-03', 20, 35);
      expect(doc.text).toHaveBeenCalledWith('Total de facturas: 2', 20, 70);
      expect(doc.addPage).toHaveBeenCalledTimes(3);
      expect(autoTable).toHaveBeenCalledTimes(3);
      expect(doc.save).toHaveBeenCalledWith(expect.stringMatching(/^reporte-facturas-2026-03-\d{4}-\d{2}-\d{2}\.pdf$/));
    });

    test('sin datos solo genera el resumen', () => {
      exportarPDF(reporte({ facturasPorMes: [], topProveedores: [], facturasRecientes: [] }));
      const doc = pdf();
      expect(doc.text).toHaveBeenCalledWith('Período: Todos los períodos', 20, 35);
      expect(doc.addPage).not.toHaveBeenCalled();
      expect(doc.save).toHaveBeenCalledWith(expect.stringMatching(/^reporte-facturas-todos-/));
    });

    test('calcula el porcentaje del total por mes', () => {
      exportarPDF(reporte({ facturasPorMes: [{ mes: '2026-03', cantidad: 1, monto: 750 }] }));
      const porMes = (autoTable as jest.Mock).mock.calls.at(-1)[1];
      expect(porMes.body[0][3]).toBe('25.0%');
    });
  });

  describe('exportarExcel', () => {
    const sheetsOf = () => {
      const wb = (saveAs as unknown as jest.Mock).mock.calls[0][0];
      expect(wb).toBeInstanceOf(Blob);
      return (XLSX.utils.book_append_sheet as jest.Mock).mock.calls.map((c: any[]) => [c[2], XLSX.utils.sheet_to_json(c[1], { header: 1 })]);
    };

    beforeEach(() => jest.spyOn(XLSX.utils, 'book_append_sheet'));

    test('crea las 4 hojas y guarda un .xlsx', () => {
      exportarExcel(reporte(), '2026-03');
      const sheets = sheetsOf();
      expect(sheets.map(s => s[0])).toEqual(['Resumen', 'Facturas', 'Top Proveedores', 'Por Mes']);
      expect((saveAs as unknown as jest.Mock).mock.calls[0][1]).toMatch(/^reporte-facturas-2026-03-.*\.xlsx$/);
    });

    test('la distribución de impuestos es un porcentaje del monto total', () => {
      exportarExcel(reporte());
      const resumen = sheetsOf()[0][1] as any[][];
      expect(resumen).toContainEqual(['IVA:', '19.0%']);
      expect(resumen).toContainEqual(['ReteFuente:', '2.0%']);
    });

    test('la fecha de la factura no se corre por la zona horaria', () => {
      exportarExcel(reporte());
      const facturas = sheetsOf()[1][1] as any[][];
      expect(facturas[1][1]).toBe(new Date(Date.UTC(2026, 2, 1)).toLocaleDateString(undefined, { timeZone: 'UTC' }));
      expect(facturas[1][1]).not.toMatch(/28/);
    });

    test('con total 0 los porcentajes son 0.0% y no NaN', () => {
      exportarExcel(reporte({ totalMonto: 0, totalIva: 0, totalReteFuente: 0, totalIca: 0, facturasPorMes: [{ mes: '2026-03', cantidad: 0, monto: 0 }] }));
      const all = JSON.stringify(sheetsOf());
      expect(all).not.toContain('NaN');
      expect(all).toContain('0.0%');
    });
  });
});
