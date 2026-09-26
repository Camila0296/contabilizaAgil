const jwt = require('jsonwebtoken');
const User = require('../models/user');

const PENDING_ALLOWED = [
  ['GET', '/api/users/me'],
  ['PUT', '/api/users/me/documento']
];

function isAllowedWhilePending(req) {
  const path = (req.originalUrl || '').split('?')[0].replace(/\/+$/, '');
  return PENDING_ALLOWED.some(([method, p]) => req.method === method && path === p);
}

// Middleware para verificar token JWT y adjuntar usuario a la petición
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    console.log('[AUTH] Token decodificado:', { id: decoded.id, role: decoded.role });

    // Obtener el usuario completo con sus roles
    const user = await User.findById(decoded.id).populate('role');
    console.log('[AUTH] User encontrado:', !!user, { id: user?._id, email: user?.email, role: user?.role });

    if (!user) {
      console.log('[AUTH] ERROR: Usuario no encontrado para ID:', decoded.id);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.activo === false) {
      return res.status(401).json({ error: 'Cuenta deshabilitada' });
    }

    // Una cuenta pendiente de aprobación solo puede consultar su perfil y cargar su documento
    if (!user.approved && !isAllowedWhilePending(req)) {
      return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
    }

    // Asegurarse de que el rol sea un array
    let userRoles = [];
    if (user.role && user.role.name) {
      // Si es un solo rol
      userRoles = [user.role.name.toLowerCase()];
    } else if (Array.isArray(user.role)) {
      // Si es un array de roles
      userRoles = user.role.map(r => r.name.toLowerCase());
    }

    // Adjuntar información del usuario a la petición
    req.user = {
      id: user._id.toString(),
      roles: userRoles
    };
    
    next();
  } catch (err) {
    console.error('Error en autenticación:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
