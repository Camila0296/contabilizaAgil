// Procesador personalizado para las pruebas de carga
module.exports = {
    // Este hook se ejecuta después de cada solicitud
    afterResponse: (requestParams, response, context, ee, next) => {
        // Aquí puedes agregar lógica personalizada para procesar las respuestas
        // Por ejemplo, verificar códigos de estado, extraer datos, etc.
        
        // Ejemplo: Registrar si la respuesta fue exitosa
        if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log(`✅ Petición exitosa a ${requestParams.url}`);
        } else {
            console.log(`❌ Error en ${requestParams.url}: ${response.statusCode}`);
        }
        
        return next();
    },
    
    // Este hook se ejecuta si hay un error en la solicitud
    onError: (requestParams, response, context, ee, next) => {
        console.error(`❌ Error en la petición a ${requestParams.url}:`, response.message);
        return next();
    }
};
