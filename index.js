require('dotenv').config();
const express = require('express');

const morgan = require('morgan');

const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./backend/swagger');

const app = express(); // la constante app tendrá ahora todo el funcionamiento del servidor

const { mongoose } = require('./backend/database'); // no se quiere todo el archivo sino la conexión
/** * Se crea una REST API, es la manera de decirle al servidor que reciba y envíe datos  */
// Configuraciones
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev')); 

app.use(express.json()); // método que ayuda a convertir el código para que el servidor pueda entender lo que viene del cliente.


app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// rutas de nuestro servidor

// Importa y usa las rutas
app.use('/api/auth', require('./backend/routes/auth.route'));
app.use('/api/users', require('./backend/routes/user.route'));
app.use('/api/facturas', require('./backend/routes/factura.route'));
app.use('/api/roles', require('./backend/routes/role.route'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciando el servidor
app.listen(app.get('port'), '0.0.0.0', () => {
    console.log('server activo en el puerto', app.get('port'));
});