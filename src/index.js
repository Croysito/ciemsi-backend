const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./presentation/routes/authRoutes');
const pacienteRoutes = require('./presentation/routes/pacienteRoutes');
const historialRoutes = require('./presentation/routes/historialRoutes');
const ciudadRoutes = require('./presentation/routes/ciudadRoutes');
const driveRoutes = require('./presentation/routes/driveRoutes');
const asistenteRoutes = require('./presentation/routes/asistenteRoutes');
const servicioRoutes = require('./presentation/routes/servicioRoutes');
const agendaRoutes = require('./presentation/routes/agendaRoutes');
const citaRoutes = require('./presentation/routes/citaRoutes');
const notificacionRoutes = require('./presentation/routes/notificacionRoutes');
const suministroRoutes = require('./presentation/routes/suministroRoutes');
const compraRoutes = require('./presentation/routes/compraRoutes');
const tratamientoRoutes = require('./presentation/routes/tratamientoRoutes');
const recetaRoutes = require('./presentation/routes/recetaRoutes');
const ingresoRoutes = require('./presentation/routes/ingresoRoutes');
const deudaRoutes = require('./presentation/routes/deudaRoutes');
const productoRoutes = require('./presentation/routes/productoRoutes');
const trasladoRoutes = require('./presentation/routes/trasladoRoutes');


const app = express();
app.use(express.json());


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/ciudades', ciudadRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/asistentes', asistenteRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/suministros', suministroRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/tratamientos', tratamientoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/deudas', deudaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/traslados', trasladoRoutes);

// Servir archivos estáticos (PDFs)
app.use('/public', express.static('public'));


app.get('/', (req, res) => {
  res.json({ mensaje: '🚀 Servidor CIEMSI funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});