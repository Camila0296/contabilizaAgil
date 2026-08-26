// Cálculo centralizado de impuestos (IVA 19%, Retefuente, ICA)
// Usado tanto en los modelos reales (pre-save hooks) como en los mocks

function calcularImpuestos(monto, retefuentePct = 0, icaPct = 0) {
  return {
    iva: +(monto * 0.19).toFixed(2),
    retefuente: +(monto * (retefuentePct || 0) / 100).toFixed(2),
    ica: +(monto * (icaPct || 0) / 100).toFixed(2)
  };
}

module.exports = { calcularImpuestos };
