import React from 'react';

// Formato de paginación que devuelven los listados del backend
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const PAGE_SIZE = 20;

interface PaginacionProps {
  pagination: PaginationInfo | null;
  onPageChange: (page: number) => void;
}

const Paginacion: React.FC<PaginacionProps> = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  const desde = (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm" aria-label="Paginación">
      <span className="text-gray-600">
        Mostrando {desde}–{hasta} de {total}
      </span>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span className="text-gray-700">Página {page} de {pages}</span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
};

export default Paginacion;
