Feature: Dashboard Principal
  Como usuario del sistema
  Quiero ver un dashboard informativo
  Para tener una visión general del sistema

  Background:
    Given que estoy autenticado en el sistema

  @smoke @dashboard
  Scenario: Ver estadísticas del dashboard
    Given que estoy en la página principal
    Then debería ver las siguientes estadísticas:
      | Estadística        | Descripción                    |
      | Total Facturas     | Número total de facturas       |
      | Ingresos Mensuales | Ingresos del mes actual        |
      | Usuarios Activos   | Número de usuarios activos     |
      | Pendientes         | Facturas pendientes de aprobar |

  @dashboard @navigation
  Scenario: Navegación desde el dashboard
    Given que estoy en la página principal
    When hago clic en "Nueva Factura"
    Then debería ser redirigido a la página de crear factura
    When regreso al dashboard
    And hago clic en "Generar Reporte"
    Then debería ser redirigido a la página de reportes
    When regreso al dashboard
    And hago clic en "Gestionar Usuarios"
    Then debería ser redirigido a la página de usuarios

  @dashboard @recent
  Scenario: Ver actividades recientes
    Given que existen actividades recientes en el sistema
    When estoy en la página principal
    Then debería ver una lista de actividades recientes
    And cada actividad debería mostrar:
      | Campo     | Descripción           |
      | Fecha     | Fecha de la actividad |
      | Usuario   | Usuario que la realizó |
      | Acción    | Tipo de acción        |
      | Detalle   | Descripción detallada | 