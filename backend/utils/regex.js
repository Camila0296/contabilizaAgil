// Escapa un texto de usuario para usarlo como literal dentro de un RegExp / $regex
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
