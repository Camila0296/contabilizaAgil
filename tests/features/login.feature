# language: es
Característica: Autenticación de usuario
  Como usuario del sistema
  Quiero poder iniciar sesión
  Para acceder a las funcionalidades restringidas

  Escenario: Inicio de sesión exitoso
    Dado que estoy en la página de inicio de sesión
    Cuando ingreso el email "admin@admin.com"
    Y ingreso la contraseña "admin123"
    Y hago clic en el botón "Iniciar sesión"
    Entonces debería ser redirigido al dashboard

  Escenario: Intento de inicio de sesión con credenciales inválidas
    Dado que estoy en la página de inicio de sesión
    Cuando ingreso el email "usuario@invalido.com"
    Y ingreso la contraseña "contraseñaIncorrecta"
    Y hago clic en el botón "Iniciar sesión"
    Entonces debería ver un mensaje de error
