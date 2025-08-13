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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroMes]);

  const fetchReportes = async () => {
    try {
      console.log('Iniciando fetchReportes');
      setLoading(true);
      let url = '/facturas/reportes';
      if (filtroMes) {
        url += `?mes=${filtroMes}`;
      }
      
      console.log('Realizando petición a:', url);
      const res = await apiFetch(url);
      console.log('Respuesta recibida, status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error ${res.status}: ${res.statusText}. Detalles: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Datos recibidos:', data);
      
      if (!data || (data.totalFacturas === 0 && data.facturasPorMes?.length === 0)) {
        setError('No se encontraron datos de facturas para mostrar en el reporte.');
      } else {
        setError(null);
        setReporteData(data);
      }
    } catch (error: unknown) {
      console.error('Error en fetchReportes:', error);
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Intentar extraer el mensaje de error del cuerpo de la respuesta si está disponible
        try {
          const errorResponse = JSON.parse(errorMessage.split('Detalles: ')[1] || '{}');
          if (errorResponse.error) {
            errorMessage = errorResponse.error;
          }
        } catch (e) {
          // Si no se puede parsear, usar el mensaje de error original
        }
      }
      
      setError(`No se pudieron cargar los reportes: ${errorMessage}`);
      showError(`No se pudieron cargar los reportes: ${errorMessage}`);
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
          <span className="text-gray-700">Cargando reportes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchReportes}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reintentar
        </button>
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
          <button 
            onClick={fetchReportes}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Ensure all arrays are defined before mapping
  const facturasPorMes = reporteData.facturasPorMes || [];
  const topProveedores = reporteData.topProveedores || [];
  const facturasRecientes = reporteData.facturasRecientes || [];
  
  // Calculate percentages safely
  const totalMonto = reporteData.totalMonto || 1; // Avoid division by zero

  return (
    <div className="container mx-auto px-4 pt-24 pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">Resumen y análisis de facturas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="form-select w-full sm:w-auto"
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generarReportePDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={exportarExcelReporte}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Facturas Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Total Facturas</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{reporteData.totalFacturas}</p>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-50">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Monto Total Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Monto Total</p>
              <p className="text-xl font-semibold text-green-600 truncate">{formatCurrency(reporteData.totalMonto)}</p>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-50">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total IVA Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Total IVA</p>
              <p className="text-xl font-semibold text-purple-600 truncate">{formatCurrency(reporteData.totalIva)}</p>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-purple-50">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* ReteFuente Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">ReteFuente</p>
              <p className="text-xl font-semibold text-amber-600 truncate">{formatCurrency(reporteData.totalReteFuente)}</p>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-amber-50">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total ICA Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 truncate">Total ICA</p>
              <p className="text-xl font-semibold text-cyan-600 truncate">{formatCurrency(reporteData.totalIca)}</p>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-cyan-50">
              <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
              {facturasPorMes.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No hay datos de facturas por mes
                </div>
              ) : (
                facturasPorMes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.mes}</p>
                      <p className="text-sm text-gray-500">{item.cantidad} facturas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.monto)}</p>
                      <p className="text-xs text-gray-500">
                        {((item.monto / totalMonto) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              )}
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
              {topProveedores.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No hay datos de proveedores
                </div>
              ) : (
                topProveedores.map((proveedor, index) => (
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
                ))
              )}
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
                {facturasRecientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No hay facturas recientes
                    </td>
                  </tr>
                ) : (
                  facturasRecientes.map(factura => (
                    <tr key={factura._id} className="table-row">
                      <td className="table-cell font-medium">{factura.numero}</td>
                      <td className="table-cell text-sm text-gray-500">
                        {new Date(factura.fecha).toLocaleDateString()}
                      </td>
                      <td className="table-cell">{factura.proveedor}</td>
                      <td className="table-cell font-semibold">{formatCurrency(factura.monto)}</td>
                      <td className="table-cell text-sm">{formatCurrency(factura.impuestos?.iva || 0)}</td>
                      <td className="table-cell text-sm">{formatCurrency(factura.impuestos?.retefuente || 0)}</td>
                      <td className="table-cell text-sm">{formatCurrency(factura.impuestos?.ica || 0)}</td>
                    </tr>
                  ))
                )}
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
                {formatCurrency(reporteData.totalIva || 0)}
              </div>
              <div className="text-sm font-medium text-blue-800">Total IVA (19%)</div>
              <div className="text-xs text-blue-600 mt-1">
                {((reporteData.totalIva / totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>

            <div className="text-center p-6 bg-warning-50 rounded-lg">
              <div className="text-3xl font-bold text-warning-600 mb-2">
                {formatCurrency(reporteData.totalReteFuente || 0)}
              </div>
              <div className="text-sm font-medium text-warning-800">Total ReteFuente</div>
              <div className="text-xs text-warning-600 mt-1">
                {((reporteData.totalReteFuente / totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(reporteData.totalIca || 0)}
              </div>
              <div className="text-sm font-medium text-purple-800">Total ICA</div>
              <div className="text-xs text-purple-600 mt-1">
                {((reporteData.totalIca / totalMonto) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
