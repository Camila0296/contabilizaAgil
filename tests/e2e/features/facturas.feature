Feature: Gestión de Facturas
  Como usuario del sistema
  Quiero poder gestionar facturas
  Para mantener un control de los documentos contables

  Background:
    Given que estoy autenticado en el sistema
    And estoy en la sección de facturas

  @smoke @facturas
  Scenario: Crear una nueva factura
    Given que estoy en la página de crear factura
    When completo el formulario con los siguientes datos:
      | Campo      | Valor                    |
      | Número     | F001-2024                |
      | Fecha      | 2024-01-15               |
      | Proveedor  | Proveedor Test S.A.S     |
      | Monto      | 1500000                  |
      | PUC        | 5110                     |
      | Detalle    | Servicios de consultoría |
    And hago clic en "Guardar factura"
    Then debería ver un mensaje de confirmación
    And la factura debería aparecer en la lista

  @facturas @edit
  Scenario: Editar una factura existente
    Given que existe una factura en el sistema
    When hago clic en "Editar" para esa factura
    And modifico el campo "Monto" a "2000000"
    And hago clic en "Actualizar"
    Then debería ver un mensaje de actualización exitosa
    And los cambios deberían reflejarse en la lista

  @facturas @delete
  Scenario: Eliminar una factura
    Given que existe una factura en el sistema
    When hago clic en "Eliminar" para esa factura
    And confirmo la eliminación
    Then debería ver un mensaje de eliminación exitosa
    And la factura no debería aparecer en la lista

  @facturas @search
  Scenario: Buscar facturas
    Given que existen varias facturas en el sistema
    When ingreso "F001" en el campo de búsqueda
    And hago clic en "Buscar"
    Then debería ver solo las facturas que coincidan con la búsqueda

  @facturas @export
  Scenario: Exportar facturas a Excel
    Given que existen facturas en el sistema
    When hago clic en "Exportar a Excel"
    Then debería descargarse un archivo Excel
    And el archivo debería contener las facturas del sistema 