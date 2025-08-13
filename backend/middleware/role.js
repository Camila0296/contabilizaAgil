// Middleware para verificar que el usuario tenga al menos uno de los roles permitidos
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!req.user.roles || !Array.isArray(req.user.roles) || req.user.roles.length === 0) {
      return res.status(403).json({ 
        error: 'Acceso denegado: el usuario no tiene roles asignados' 
      });
    }

    // Asegurarse de que los roles del usuario sean strings y estén en minúsculas
    const userRoles = req.user.roles.map(role => 
      typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase()
    );

    // Convertir los roles permitidos a minúsculas para comparación insensible a mayúsculas
    const allowedRolesLower = allowedRoles.map(role => 
      typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase()
    );

    // Verificar que el usuario tenga al menos uno de los roles permitidos
    const hasPermission = userRoles.some(role => allowedRolesLower.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Acceso denegado: no tienes los permisos necesarios',
        requiredRoles: allowedRoles,
        userRoles: req.user.roles
      });
    }

    next();
  };
};
