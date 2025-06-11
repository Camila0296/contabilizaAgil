const LOCAL_API = 'http://localhost:3000/api';
const CODESPACE_API = 'https://verbose-cod-4q4x4v7v7rp37jj-3000.app.github.dev/api';

// Si existe REACT_APP_API_URL, úsala. Si no, usa LOCAL_API en desarrollo y CODESPACE_API en otros casos.
export const API_URL = LOCAL_API;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  return res;
}