// Cálculo centralizado de impuestos para facturas de compra/servicios
// Usado tanto en los modelos reales (pre-save hooks) como en los mocks
// Estructura: Monto + IVA(19%) - ReteFuente - ICA = Total a Pagar

function calcularImpuestos(monto, retefuentePct = 0, icaPct = 0) {
  const iva = +(monto * 0.19).toFixed(2);
  const retefuente = +(monto * (retefuentePct || 0) / 100).toFixed(2);
  const ica = +(monto * (icaPct || 0) / 100).toFixed(2);

  // Total a pagar: Monto + IVA - Retenciones
  const totalAPagar = +(monto + iva - retefuente - ica).toFixed(2);

  return {
    iva,
    retefuente,
    ica,
    totalAPagar
  };
}

module.exports = { calcularImpuestos };
