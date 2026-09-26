// Rol del usuario autenticado (lo guarda Login en localStorage al iniciar sesión)
export type Role = 'administrador' | 'contador' | 'analista' | 'auxiliar';

export function getRole(): Role | null {
  return (localStorage.getItem('role') as Role | null) || null;
}

export function hasRole(...roles: Role[]): boolean {
  const role = getRole();
  return role !== null && roles.includes(role);
}

// Roles que pueden editar/eliminar registros (el auxiliar solo crea) — ver RBAC del backend
export const ROLES_GESTION: Role[] = ['administrador', 'contador', 'analista'];

// Roles que administran catálogos (terceros: editar/eliminar; PUC: crear/editar/eliminar)
export const ROLES_CATALOGO: Role[] = ['administrador', 'contador'];
