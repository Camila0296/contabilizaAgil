const LOCAL_API = 'http://localhost:3000/api';

// Si existe REACT_APP_API_URL, úsala. Si no, usa LOCAL_API en desarrollo y CODESPACE_API en otros casos.
export const API_URL = LOCAL_API;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  return res;
}