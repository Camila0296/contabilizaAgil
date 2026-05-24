import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { formatCurrency } from '../utils/format';
import { showError } from '../utils/alerts';

interface HomeProps {
  onSectionChange?: (section: 'panel' | 'facturacion' | 'reportes' | 'usuarios' | 'aprobaciones' | 'perfil') => void;
}

interface DashboardStats {
  totalFacturas: number;
  totalMonto: number;
  usuariosActivos: number;
  usuariosPendientes: number;
  facturasRecientes: Array<{
    id: string;
    numero: string;
    proveedor: string;
    monto: number;
    fecha: string;
    usuario: string;
  }>;
}

const Home: React.FC<HomeProps> = ({ onSectionChange }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await apiFetch('/facturas/dashboard-stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      showError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaFactura = () => {
    onSectionChange?.('facturacion');
  };

  const handleGenerarReporte = () => {
    onSectionChange?.('reportes');
  };

  const handleGestionarUsuarios = () => {
    onSectionChange?.('usuarios');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Facturas',
      value: stats?.totalFacturas?.toLocaleString() ?? '0',
      sub: 'documentos registrados',
      iconClass: 'stat-icon-indigo',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Monto Total',
      value: formatCurrency(stats?.totalMonto ?? 0),
      sub: 'en facturación',
      iconClass: 'stat-icon-teal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Usuarios Activos',
      value: stats?.usuariosActivos?.toString() ?? '0',
      sub: 'en el sistema',
      iconClass: 'stat-icon-emerald',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Pendientes',
      value: stats?.usuariosPendientes?.toString() ?? '0',
      sub: 'esperando aprobación',
      iconClass: 'stat-icon-amber',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const recentActivities = (stats?.facturasRecientes || []).map((factura, index) => ({
    id: index + 1,
    action: 'Nueva factura creada',
    description: `Factura #${factura?.numero || 'N/A'} por ${formatCurrency(factura?.monto || 0)}`,
    time: factura?.fecha ? new Date(factura.fecha).toLocaleDateString('es-ES') : 'Fecha no disponible',
    type: 'factura' as const
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 45%, #0ea5e9 100%)', boxShadow: '0 8px 40px rgba(124,58,237,0.42)' }}>
        {/* Orbes decorativos */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)' }} />
        <div className="absolute right-32 -bottom-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.30) 0%, transparent 65%)' }} />
        <div className="absolute left-1/2 top-0 w-px h-full pointer-events-none opacity-10"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
        {/* Contenido */}
        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-2">Contabiliza Ágil</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">Panel de Control</h1>
            <p className="text-white/65 text-sm mt-1.5">Resumen ejecutivo de tu empresa en tiempo real</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-xs">Hoy</p>
              <p className="text-white text-sm font-semibold">
                {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const cardClasses = ['stat-card stat-card-1', 'stat-card stat-card-2', 'stat-card stat-card-3', 'stat-card stat-card-4'];
          return (
            <div key={index} className={cardClasses[index]}>
              {/* Ícono decorativo de fondo */}
              <div className="absolute -right-3 -bottom-3 text-white pointer-events-none"
                style={{ opacity: 0.10, transform: 'scale(3.8)', transformOrigin: 'bottom right' }}>
                {stat.icon}
              </div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2 truncate font-display font-mono-num">{stat.value}</p>
                  <p className="text-xs text-white/55 mt-1.5">{stat.sub}</p>
                </div>
                <div className="flex-shrink-0 ml-3 text-white p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)', color: '#7c3aed' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 font-display">Actividad Reciente</h3>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
            {recentActivities.length} registros
          </span>
        </div>
        <div className="card-body">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#f5f3ff' }}>
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-2xl transition-colors"
                  style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fafafa')}>
                  <div className="p-2.5 rounded-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed18, #4f46e518)', color: '#7c3aed' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="card group cursor-pointer" onClick={handleNuevaFactura}>
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 font-display">Nueva Factura</h3>
            <p className="text-gray-500 text-sm mb-4">Crear una nueva factura en el sistema</p>
            <button className="btn btn-gradient w-full">Crear Factura</button>
          </div>
        </div>

        <div className="card group cursor-pointer" onClick={handleGenerarReporte}>
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 font-display">Generar Reporte</h3>
            <p className="text-gray-500 text-sm mb-4">Exporta reportes financieros y contables</p>
            <button className="btn btn-success w-full">Generar Reporte</button>
          </div>
        </div>

        <div className="card group cursor-pointer" onClick={handleGestionarUsuarios}>
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 font-display">Gestionar Usuarios</h3>
            <p className="text-gray-500 text-sm mb-4">Administrar usuarios y permisos</p>
            <button className="btn btn-secondary w-full">Gestionar</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;