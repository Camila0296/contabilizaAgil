import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { formatCurrency } from '../utils/format';
import { showError } from '../utils/alerts';
import { exportarPDF, exportarExcel } from '../utils/export';

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

const Reportes: React.FC = () => {
  const [reporteData, setReporteData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState<string>('');

  useEffect(() => {
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroMes]);

  const fetchReportes = async () => {
    try {
      let url = '/facturas/reportes';
      if (filtroMes) {
        url += `?mes=${filtroMes}`;
      }
      
      const res = await apiFetch(url);
      const data = await res.json();
      setReporteData(data);
    } catch {
      showError('No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const getMesActual = () => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  };

  const generarReportePDF = () => {
    if (reporteData) {
      exportarPDF(reporteData, filtroMes || getMesActual());
    } else {
      showError('No hay datos para exportar');
    }
  };

  const exportarExcelReporte = () => {
    if (reporteData) {
      exportarExcel(reporteData, filtroMes || getMesActual());
    } else {
      showError('No hay datos para exportar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500">Generando reportes...</span>
        </div>
      </div>
    );
  }

  if (!reporteData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No se pudieron cargar los reportes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">Análisis detallado de facturas y transacciones</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="form-select"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Todos los meses</option>
            <option value="2024-01">Enero 2024</option>
            <option value="2024-02">Febrero 2024</option>
            <option value="2024-03">Marzo 2024</option>
            <option value="2024-04">Abril 2024</option>
            <option value="2024-05">Mayo 2024</option>
            <option value="2024-06">Junio 2024</option>
            <option value="2024-07">Julio 2024</option>
            <option value="2024-08">Agosto 2024</option>
            <option value="2024-09">Septiembre 2024</option>
            <option value="2024-10">Octubre 2024</option>
            <option value="2024-11">Noviembre 2024</option>
            <option value="2024-12">Diciembre 2024</option>
          </select>
          
          <button
            className="btn btn-outline flex items-center space-x-2"
            onClick={exportarExcelReporte}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Excel</span>
          </button>
          
          <button
            className="btn btn-primary flex items-center space-x-2"
            onClick={generarReportePDF}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                <p className="text-2xl font-bold text-gray-900">{reporteData.totalFacturas}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(reporteData.totalMonto)}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total IVA</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(reporteData.totalIva)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ReteFuente</p>
                <p className="text-2xl font-bold text-warning-600">{formatCurrency(reporteData.totalReteFuente)}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total ICA</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(reporteData.totalIca)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facturas por Mes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Facturas por Mes</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {reporteData.facturasPorMes.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.mes}</p>
                    <p className="text-sm text-gray-500">{item.cantidad} facturas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.monto)}</p>
                    <p className="text-xs text-gray-500">
                      {((item.monto / reporteData.totalMonto) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Proveedores */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Proveedores</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {reporteData.topProveedores.map((proveedor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{proveedor.proveedor}</p>
                      <p className="text-sm text-gray-500">{proveedor.cantidad} facturas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(proveedor.monto)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Facturas Recientes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Facturas Recientes</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Monto</th>
                  <th>IVA</th>
                  <th>ReteFuente</th>
                  <th>ICA</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {reporteData.facturasRecientes.map(factura => (
                  <tr key={factura._id} className="table-row">
                    <td className="table-cell font-medium">{factura.numero}</td>
                    <td className="table-cell text-sm text-gray-500">
                      {new Date(factura.fecha).toLocaleDateString()}
                    </td>
                    <td className="table-cell">{factura.proveedor}</td>
                    <td className="table-cell font-semibold">{formatCurrency(factura.monto)}</td>
                    <td className="table-cell text-sm">{formatCurrency(factura.impuestos.iva)}</td>
                    <td className="table-cell text-sm">{formatCurrency(factura.impuestos.retefuente)}</td>
                    <td className="table-cell text-sm">{formatCurrency(factura.impuestos.ica)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resumen de Impuestos */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Impuestos</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(reporteData.totalIva)}
              </div>
              <div className="text-sm font-medium text-blue-800">Total IVA (19%)</div>
              <div className="text-xs text-blue-600 mt-1">
                {((reporteData.totalIva / reporteData.totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>

            <div className="text-center p-6 bg-warning-50 rounded-lg">
              <div className="text-3xl font-bold text-warning-600 mb-2">
                {formatCurrency(reporteData.totalReteFuente)}
              </div>
              <div className="text-sm font-medium text-warning-800">Total ReteFuente</div>
              <div className="text-xs text-warning-600 mt-1">
                {((reporteData.totalReteFuente / reporteData.totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(reporteData.totalIca)}
              </div>
              <div className="text-sm font-medium text-purple-800">Total ICA</div>
              <div className="text-xs text-purple-600 mt-1">
                {((reporteData.totalIca / reporteData.totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
