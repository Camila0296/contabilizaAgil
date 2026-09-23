/**
 * Utilidades para el cargue simulado de documentos de identidad (cédula).
 */
import { ValidationError } from './validation';

export const TIPOS_DOCUMENTO_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
export const MAX_DOCUMENTO_MB = 5;

// Convierte un File a un data URI base64 (data:<tipo>;base64,<...>)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function validateDocumentoFile(file: File | null): ValidationError | null {
  if (!file) {
    return { field: 'documentoIdentidad', message: 'Selecciona un archivo (JPG, PNG o PDF)' };
  }
  if (!TIPOS_DOCUMENTO_PERMITIDOS.includes(file.type)) {
    return { field: 'documentoIdentidad', message: 'El archivo debe ser JPG, PNG o PDF' };
  }
  if (file.size > MAX_DOCUMENTO_MB * 1024 * 1024) {
    return { field: 'documentoIdentidad', message: `El archivo no puede superar ${MAX_DOCUMENTO_MB}MB` };
  }
  return null;
}
