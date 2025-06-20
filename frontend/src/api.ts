const LOCAL_API = 'http://localhost:3000/api';

// Si existe REACT_APP_API_URL, úsala. Si no, usa LOCAL_API en desarrollo y CODESPACE_API en otros casos.
export const API_URL = LOCAL_API;

export async function apiFetch(path: string, options: RequestInit = {}) {
    // Añadir token JWT si existe
  const token = localStorage.getItem('token');
  const defaultHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...defaultHeaders
    }
  };
  const res = await fetch(`${API_URL}${path}`, mergedOptions);
  return res;
}