// Este archivo se mantiene para compatibilidad con versiones anteriores
// La configuración ahora se maneja directamente en package.json

const path = require('path');
const fs = require('fs');
const { generate } = require('./support/reporter');

// Configuración de rutas
const baseDir = path.join(__dirname); // Apunta a la carpeta tests
const reportDir = path.join(baseDir, 'reports'); // Ahora será tests/e2e/reports
const jsonReportPath = path.join(reportDir, 'cucumber-report.json');

// Asegurar que el directorio de reportes exista
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Configuración de Cucumber
module.exports = {
  default: {
    // Especificar los módulos de soporte
    requireModule: ['@babel/register'],
    require: [
      'e2e/features/**/*.feature',
      'e2e/step-definitions/**/*.js',
      'e2e/support/**/*.js'
    ],
    
    // Configuración de formatos de salida
    format: [
      'json',
      'pretty',
      `json:${jsonReportPath}`,
      `html:${path.join(reportDir, 'html', 'cucumber_report.html')}`
    ],
    
    // Opciones de formato
    formatOptions: {
      colorsEnabled: true,
      theme: {
        passed: 'green',
        failed: 'red',
        pending: 'yellow',
        skipped: 'blue'
      },
      json: {
        enabled: true,
        output: jsonReportPath
      }
    },
    
    // Comportamiento de ejecución
    publishQuiet: true,
    failFast: false,
    retry: 0,
    tags: 'not @wip and not @skip',
    parallel: 1,
    timeout: 30000,
    
    // Hooks globales
    before: async function() {
      console.log('🚀 Iniciando pruebas E2E...');
    },
    
    after: async function() {
      console.log('✅ Pruebas E2E finalizadas');
      
      // Generar reporte HTML
      try {
        await generate();
        console.log('📊 Reporte HTML generado exitosamente');
      } catch (error) {
        console.error('❌ Error generando reporte HTML:', error);
      }
    }
  },
  ci: {
    paths: ['e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.js', 'e2e/step-definitions/**/*.js'],
    format: [`json:${path.join(reportDir, 'cucumber-report.json')}`],
    timeout: 20000,
    publishQuiet: true,
    parallel: 1,
    tags: 'not @wip and not @slow',
    afterLaunch: function() {
      try {
        const { generate } = require('./support/reporter');
        generate();
      } catch (error) {
        console.error('Error al generar el reporte:', error);
      }
    }
  }
}; 