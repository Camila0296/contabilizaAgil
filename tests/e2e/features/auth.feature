# language: es

Característica: Autenticación de usuarios
  Como usuario del sistema
  Quiero poder autenticarme
  Para acceder a las funcionalidades del sistema

  Escenario: Login exitoso con credenciales válidas
    Dado que el sistema está funcionando correctamente
    Y que estoy en la página de login
    Cuando ingreso el email "admin@admin.com"
    Y ingreso la contraseña "admin"
    Y hago clic en el botón "Iniciar sesión"
    Entonces debería ser redirigido al dashboard
    Y debería ver el mensaje de bienvenida
    Y debería ver las opciones del menú principal

  @wip
  Escenario: Cerrar sesión exitosamente
    Dado que el sistema está funcionando correctamente
    Y que estoy autenticado en el sistema
    Cuando hago clic en el botón de cerrar sesión
    Entonces debería ser redirigido a la página de login
    Y no debería poder acceder a las páginas protegidas