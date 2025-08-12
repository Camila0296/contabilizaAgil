Feature: Gestión de Usuarios
  Como administrador del sistema
  Quiero poder gestionar usuarios
  Para controlar el acceso y permisos

  Background:
    Given que estoy autenticado como administrador
    And estoy en la sección de usuarios

  @smoke @usuarios
  Scenario: Crear un nuevo usuario
    Given que estoy en la página de crear usuario
    When completo el formulario con los siguientes datos:
      | Campo        | Valor                    |
      | Nombres      | Juan                     |
      | Apellidos    | Pérez                    |
      | Email        | juan.perez@empresa.com   |
      | Contraseña   | password123              |
      | Rol          | Usuario                  |
    And hago clic en "Crear usuario"
    Then debería ver un mensaje de confirmación
    And el usuario debería aparecer en la lista

  @usuarios @edit
  Scenario: Editar un usuario existente
    Given que existe un usuario en el sistema
    When hago clic en "Editar" para ese usuario
    And modifico el campo "Nombres" a "Juan Carlos"
    And hago clic en "Actualizar"
    Then debería ver un mensaje de actualización exitosa
    And los cambios deberían reflejarse en la lista

  @usuarios @delete
  Scenario: Eliminar un usuario
    Given que existe un usuario en el sistema
    When hago clic en "Eliminar" para ese usuario
    And confirmo la eliminación
    Then debería ver un mensaje de eliminación exitosa
    And el usuario no debería aparecer en la lista

  @usuarios @approval
  Scenario: Aprobar un usuario pendiente
    Given que existe un usuario pendiente de aprobación
    When hago clic en "Aprobar" para ese usuario
    Then debería ver un mensaje de aprobación exitosa
    And el estado del usuario debería cambiar a "Aprobado"

  @usuarios @search
  Scenario: Buscar usuarios
    Given que existen varios usuarios en el sistema
    When ingreso "Juan" en el campo de búsqueda
    And hago clic en "Buscar"
    Then debería ver solo los usuarios que coincidan con la búsqueda 