const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./presentation/routes/authRoutes');
const pacienteRoutes = require('./presentation/routes/pacienteRoutes');
const historialRoutes = require('./presentation/routes/historialRoutes');
const ciudadRoutes = require('./presentation/routes/ciudadRoutes');
const driveRoutes = require('./presentation/routes/driveRoutes');

const app = express();

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/ciudades', ciudadRoutes);
app.use('/api/drive', driveRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: '🚀 Servidor CIEMSI funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});