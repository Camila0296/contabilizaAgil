import React, { useCallback, useRef } from 'react';
import AsyncSelect from 'react-select/async';

export interface Opcion {
  value: string;
  label: string;
}

interface SelectBusquedaProps {
  placeholder: string;
  // Busca en el backend las opciones que coinciden con el texto (vacío = primeras opciones)
  buscar: (texto: string) => Promise<Opcion[]>;
  value: Opcion | null;
  onChange: (opcion: Opcion | null) => void;
  espera?: number;
}

// Selector que consulta al backend mientras se escribe, en lugar de cargar todo el catálogo
const SelectBusqueda: React.FC<SelectBusquedaProps> = ({ placeholder, buscar, value, onChange, espera = 300 }) => {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Espera a que el usuario deje de escribir antes de consultar
  const loadOptions = useCallback((texto: string) => new Promise<Opcion[]>((resolve) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      buscar(texto).then(resolve).catch(() => resolve([]));
    }, espera);
  }), [buscar, espera]);

  return (
    <AsyncSelect
      classNamePrefix="react-select"
      className="react-select-container"
      cacheOptions
      defaultOptions
      isClearable
      loadOptions={loadOptions}
      placeholder={placeholder}
      value={value}
      onChange={opcion => onChange(opcion as Opcion | null)}
      noOptionsMessage={({ inputValue }) => (inputValue ? 'Sin resultados' : 'Escribe para buscar')}
      loadingMessage={() => 'Buscando...'}
    />
  );
};

export default SelectBusqueda;
