import React, { useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';
import DocumentoUploader from './DocumentoUploader';

interface RecuperarDocumentoProps {
  onBack: () => void;
}

const RecuperarDocumento: React.FC<RecuperarDocumentoProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleUpload = async (datos: string, tipo: string) => {
    if (!email.trim() || !numeroDocumento.trim()) {
      showError('Ingresa tu correo y número de documento');
      return;
    }
    try {
      const res = await apiFetch('/auth/documento-pendiente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, numeroDocumento, tipo, datos })
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess('Documento cargado. Tu cuenta sigue pendiente de aprobación.');
        setEnviado(true);
      } else {
        showError(data.error || 'No se pudo cargar el documento');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  if (enviado) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h2>
        <p className="text-gray-600 mb-6">
          Tu documento fue cargado correctamente. Un administrador revisará tu cuenta.
        </p>
        <button type="button" className="btn btn-primary w-full" onClick={onBack}>
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completar documento de identidad</h2>
        <p className="text-gray-600">
          Si te registraste pero no cargaste tu cédula, ingresa tus datos para completarlo.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="recuperar-email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            id="recuperar-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="juan.perez@email.com"
          />
        </div>

        <div>
          <label htmlFor="recuperar-documento" className="form-label">Número de documento</label>
          <input
            type="text"
            id="recuperar-documento"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value.replace(/[^\d]/g, ''))}
            required
            className="form-input"
            placeholder="1234567890"
            inputMode="numeric"
          />
        </div>

        <DocumentoUploader onSubmit={handleUpload} submitLabel="Completar cargue" />
      </div>

      <button
        type="button"
        className="w-full mt-6 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        onClick={onBack}
      >
        Volver a iniciar sesión
      </button>
    </div>
  );
};

export default RecuperarDocumento;
