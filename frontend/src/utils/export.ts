import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from './format';

interface Factura {
  _id: string;
  numero: string;
  fecha: string;
  proveedor: string;
  monto: number;
  puc: string;
  detalle: string;
  naturaleza: 'credito' | 'debito';
  impuestos: {
    iva: number;
    retefuente: number;
    ica: number;
  };
  usuario?: any;
}

interface ReporteData {
  totalFacturas: number;
  totalMonto: number;
  totalIva: number;
  totalReteFuente: number;
  totalIca: number;
  facturasPorMes: { mes: string; cantidad: number; monto: number }[];
  topProveedores: { proveedor: string; cantidad: number; monto: number }[];
  facturasRecientes: Factura[];
}

export const exportarPDF = (reporteData: ReporteData, mes?: string) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Reporte de Facturas', 105, 20, { align: 'center' });
  
  // Información del reporte
  doc.setFontSize(12);
  doc.text(`Período: ${mes || 'Todos los períodos'}`, 20, 35);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Resumen
  doc.setFontSize(14);
  doc.text('Resumen General', 20, 60);
  doc.setFontSize(10);
  doc.text(`Total de facturas: ${reporteData.totalFacturas}`, 20, 70);
  doc.text(`Monto total: ${formatCurrency(reporteData.totalMonto)}`, 20, 80);
  doc.text(`Total IVA: ${formatCurrency(reporteData.totalIva)}`, 20, 90);
  doc.text(`Total ReteFuente: ${formatCurrency(reporteData.totalReteFuente)}`, 20, 100);
  doc.text(`Total ICA: ${formatCurrency(reporteData.totalIca)}`, 20, 110);
  
  // Tabla de facturas recientes
  if (reporteData.facturasRecientes.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Facturas Recientes', 20, 20);
    
    const tableData = reporteData.facturasRecientes.map(factura => [
      factura.numero,
      new Date(factura.fecha).toLocaleDateString(),
      factura.proveedor,
      formatCurrency(factura.monto),
      formatCurrency(factura.impuestos.iva),
      formatCurrency(factura.impuestos.retefuente),
      formatCurrency(factura.impuestos.ica)
    ]);
    
    autoTable(doc, {
      head: [['Número', 'Fecha', 'Proveedor', 'Monto', 'IVA', 'ReteFuente', 'ICA']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });
  }
  
  // Tabla de top proveedores
  if (reporteData.topProveedores.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Top Proveedores', 20, 20);
    
    const tableData = reporteData.topProveedores.map((proveedor, index) => [
      index + 1,
      proveedor.proveedor,
      proveedor.cantidad,
      formatCurrency(proveedor.monto)
    ]);
    
    autoTable(doc, {
      head: [['#', 'Proveedor', 'Cantidad', 'Monto Total']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255
      }
    });
  }
  
  // Tabla de facturas por mes
  if (reporteData.facturasPorMes.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Facturas por Mes', 20, 20);
    
    const tableData = reporteData.facturasPorMes.map(item => [
      item.mes,
      item.cantidad,
      formatCurrency(item.monto),
      `${((item.monto / reporteData.totalMonto) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      head: [['Mes', 'Cantidad', 'Monto', '% del Total']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: 255
      }
    });
  }
  
  // Guardar el PDF
  const filename = `reporte-facturas-${mes || 'todos'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const exportarExcel = (reporteData: ReporteData, mes?: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE DE FACTURAS'],
    [''],
    ['Período:', mes || 'Todos los períodos'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN GENERAL'],
    ['Total de facturas:', reporteData.totalFacturas],
    ['Monto total:', reporteData.totalMonto],
    ['Total IVA:', reporteData.totalIva],
    ['Total ReteFuente:', reporteData.totalReteFuente],
    ['Total ICA:', reporteData.totalIca],
    [''],
    ['DISTRIBUCIÓN POR IMPUESTOS'],
    ['IVA:', `${((reporteData.totalIva / reporteData.totalMonto) * 100).toFixed(1)}%`],
    ['ReteFuente:', `${((reporteData.totalReteFuente / reporteData.totalMonto) * 100).toFixed(1)}%`],
    ['ICA:', `${((reporteData.totalIca / reporteData.totalMonto) * 100).toFixed(1)}%`]
  ];
  
  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');
  
  // Hoja 2: Facturas Recientes
  if (reporteData.facturasRecientes.length > 0) {
    const facturasData = [
      ['Número', 'Fecha', 'Proveedor', 'Monto', 'IVA', 'ReteFuente', 'ICA', 'PUC', 'Detalle', 'Naturaleza']
    ];
    
         reporteData.facturasRecientes.forEach(factura => {
       facturasData.push([
         factura.numero,
         new Date(factura.fecha).toLocaleDateString(),
         factura.proveedor,
         factura.monto.toString(),
         factura.impuestos.iva.toString(),
         factura.impuestos.retefuente.toString(),
         factura.impuestos.ica.toString(),
         factura.puc,
         factura.detalle,
         factura.naturaleza
       ]);
     });
    
    const facturasSheet = XLSX.utils.aoa_to_sheet(facturasData);
    XLSX.utils.book_append_sheet(workbook, facturasSheet, 'Facturas');
  }
  
  // Hoja 3: Top Proveedores
  if (reporteData.topProveedores.length > 0) {
    const proveedoresData = [
      ['#', 'Proveedor', 'Cantidad de Facturas', 'Monto Total', '% del Total']
    ];
    
         reporteData.topProveedores.forEach((proveedor, index) => {
       proveedoresData.push([
         (index + 1).toString(),
         proveedor.proveedor,
         proveedor.cantidad.toString(),
         proveedor.monto.toString(),
         `${((proveedor.monto / reporteData.totalMonto) * 100).toFixed(1)}%`
       ]);
     });
    
    const proveedoresSheet = XLSX.utils.aoa_to_sheet(proveedoresData);
    XLSX.utils.book_append_sheet(workbook, proveedoresSheet, 'Top Proveedores');
  }
  
  // Hoja 4: Facturas por Mes
  if (reporteData.facturasPorMes.length > 0) {
    const porMesData = [
      ['Mes', 'Cantidad de Facturas', 'Monto Total', '% del Total']
    ];
    
         reporteData.facturasPorMes.forEach(item => {
       porMesData.push([
         item.mes,
         item.cantidad.toString(),
         item.monto.toString(),
         `${((item.monto / reporteData.totalMonto) * 100).toFixed(1)}%`
       ]);
     });
    
    const porMesSheet = XLSX.utils.aoa_to_sheet(porMesData);
    XLSX.utils.book_append_sheet(workbook, porMesSheet, 'Por Mes');
  }
  
  // Guardar el archivo Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `reporte-facturas-${mes || 'todos'}-${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
}; 