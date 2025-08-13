const { createReadStream, createWriteStream, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { createHash } = require('crypto');
const { createHtml } = require('@cucumber/html-formatter');

// Configuración de rutas
const baseDir = join(__dirname, '..'); // Apunta a la carpeta e2e
const reportDir = join(baseDir, 'reports'); // Ahora será e2e/reports
const htmlReportDir = join(reportDir, 'html');
const screenshotsDir = join(reportDir, 'screenshots');
const jsonReportPath = join(reportDir, 'cucumber-report.json');
const htmlReportPath = join(htmlReportDir, 'cucumber_report.html');

// Asegurar que los directorios existan
[reportDir, htmlReportDir, screenshotsDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Generar un ID único para el informe
const generateId = () => createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 24);

// Generar el reporte HTML
async function generate() {
  try {
    console.log('\n🔍 Buscando archivo JSON de reporte en:', jsonReportPath);
    
    if (!existsSync(jsonReportPath)) {
      throw new Error(`No se encontró el archivo de reporte JSON en: ${jsonReportPath}`);
    }

    // Leer el archivo JSON
    const jsonContent = await new Promise((resolve, reject) => {
      const chunks = [];
      createReadStream(jsonReportPath, 'utf8')
        .on('data', chunk => chunks.push(chunk))
        .on('error', reject)
        .on('end', () => resolve(chunks.join('')));
    });

    console.log(`✅ Archivo JSON encontrado. Tamaño: ${jsonContent.length} bytes`);
    
    // Parsear el JSON
    const json = JSON.parse(jsonContent);
    
    // Crear el HTML del informe
    const html = await createHtml([json], {
      customParameters: [
        { name: 'Aplicación', value: 'Contabiliza Ágil' },
        { name: 'Entorno', value: process.env.NODE_ENV || 'development' },
        { name: 'Navegador', value: 'Chrome' },
        { name: 'Plataforma', value: process.platform },
        { name: 'Ejecutado', value: new Date().toLocaleString() }
      ],
      theme: 'bootstrap',
      customCss: `
        .navbar-brand { font-weight: bold; }
        .card-header { background-color: #f8f9fa; }
      `,
      customJs: 'console.log("Reporte generado con @cucumber/html-formatter")',
      customMetadata: true,
      customStatus: (status) => ({
        ...status,
        color: status.failed ? '#dc3545' : status.passed ? '#28a745' : '#6c757d'
      })
    });

    // Guardar el HTML generado
    await new Promise((resolve, reject) => {
      const writeStream = createWriteStream(htmlReportPath);
      writeStream.write(html, 'utf8');
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      writeStream.end();
    });

    console.log(`\n📊 Reporte HTML generado en: file://${htmlReportPath}`);
    console.log(`📸 Capturas de pantalla: file://${screenshotsDir}`);
    
    return htmlReportPath;
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

module.exports = { 
  generate, 
  options: {
    reportDir,
    htmlReportDir,
    screenshotsDir,
    jsonReportPath,
    htmlReportPath
  }
};
