import React, { useState } from 'react';
import { fileToBase64, validateDocumentoFile, TIPOS_DOCUMENTO_PERMITIDOS } from '../utils/fileUpload';

interface DocumentoUploaderProps {
  onSubmit: (datos: string, tipo: string) => Promise<void>;
  submitLabel?: string;
}

const DocumentoUploader: React.FC<DocumentoUploaderProps> = ({ onSubmit, submitLabel = 'Cargar documento' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(selected ? validateDocumentoFile(selected)?.message || null : null);
  };

  const handleSubmit = async () => {
    const validationError = validateDocumentoFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataUri = await fileToBase64(file as File);
      await onSubmit(dataUri, (file as File).type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-medium text-gray-700">Documento de identidad (JPG, PNG o PDF, máx. 5MB)</span>
        <input
          type="file"
          accept={TIPOS_DOCUMENTO_PERMITIDOS.join(',')}
          onChange={handleFileChange}
          className="form-input mt-1 block w-full text-sm"
        />
      </label>
      {file && !error && (
        <p className="text-xs text-gray-500">Seleccionado: {file.name}</p>
      )}
      {error && (
        <p className="text-xs text-danger-600">{error}</p>
      )}
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={!file || !!error || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Cargando...' : submitLabel}
      </button>
    </div>
  );
};

export default DocumentoUploader;
