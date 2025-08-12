Feature: Autenticación de Usuario
  Como usuario del sistema de facturación
  Quiero poder autenticarme de forma segura
  Para acceder a las funcionalidades del sistema

  Background:
    Given que el sistema está funcionando correctamente

  @smoke @auth
  Scenario: Login exitoso con credenciales válidas
    Given que estoy en la página de login
    When ingreso el email "admin@admin.com"
    And ingreso la contraseña "admin"
    And hago clic en el botón "Iniciar sesión"
    Then debería ser redirigido al dashboard
    And debería ver el mensaje de bienvenida
    And debería ver las opciones del menú principal

  @auth @negative
  Scenario: Login fallido con credenciales inválidas
    Given que estoy en la página de login
    When ingreso el email "usuario@invalido.com"
    And ingreso la contraseña "password"
    And hago clic en el botón "Iniciar sesión"
    Then debería ver un mensaje de error
    And debería permanecer en la página de login

  @auth @validation
  Scenario: Validación de campos requeridos
    Given que estoy en la página de login
    When intento hacer clic en "Iniciar sesión" sin llenar los campos
    Then debería ver mensajes de validación para los campos requeridos

  @auth @logout
  Scenario: Cerrar sesión exitosamente
    Given que estoy autenticado en el sistema
    When hago clic en el botón de cerrar sesión
    Then debería ser redirigido a la página de login
    And no debería poder acceder a las páginas protegidas 