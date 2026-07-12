const AgendaRepository = require('../infrastructure/repositories/AgendaRepository');
const CompraRepository = require('../infrastructure/repositories/CompraRepository');
const MovimientoExtraRepository = require('../infrastructure/repositories/MovimientoExtraRepository');
const SaldoInicialRepository    = require('../infrastructure/repositories/SaldoInicialRepository');
const CuentaRepository          = require('../infrastructure/repositories/CuentaRepository');
const DeudaRepository = require('../infrastructure/repositories/DeudaRepository');
const IngresoRepository = require('../infrastructure/repositories/IngresoRepository');
const ProductoRepository = require('../infrastructure/repositories/ProductoRepository');
const CitaRepository = require('../infrastructure/repositories/CitaRepository');
const CiudadRepository = require('../infrastructure/repositories/CiudadRepository');
const HistorialRepository = require('../infrastructure/repositories/HistorialRepository');
const PacienteRepository = require('../infrastructure/repositories/PacienteRepository');
const RecetaRepository = require('../infrastructure/repositories/RecetaRepository');
const ServicioRepository = require('../infrastructure/repositories/ServicioRepository');
const SuministroRepository = require('../infrastructure/repositories/SuministroRepository');
const TrasladoRepository = require('../infrastructure/repositories/TrasladoRepository');
const TratamientoRepository = require('../infrastructure/repositories/TratamientoRepository');
const SesionAsistenteRepository = require('../infrastructure/repositories/SesionAsistenteRepository');
const TraspasoRepository        = require('../infrastructure/repositories/TraspasoRepository');
const ConfigClinicaRepository   = require('../infrastructure/repositories/ConfigClinicaRepository');
const UsuarioRepository = require('../infrastructure/repositories/UsuarioRepository');

const EmailService = require('../infrastructure/services/EmailService');
const GoogleDriveService = require('../infrastructure/services/GoogleDriveService');
const HashService = require('../infrastructure/services/HashService');
const JwtService = require('../infrastructure/services/JwtService');
const NotificacionService = require('../infrastructure/services/NotificacionService');
const authMiddleware = require('../infrastructure/services/AuthMiddleware');

const CrearAsistente = require('../application/use-cases/asistentes/CrearAsistente');
const ListarAsistentes = require('../application/use-cases/asistentes/ListarAsistentes');
const ModificarAsistente = require('../application/use-cases/asistentes/ModificarAsistente');
const CambiarEstadoAsistente = require('../application/use-cases/asistentes/CambiarEstadoAsistente');
const CambiarPassword = require('../application/use-cases/auth/CambiarPassword');
const CerrarSesion = require('../application/use-cases/auth/CerrarSesion');
const IniciarSesion = require('../application/use-cases/auth/IniciarSesion');
const RecuperarContrasena = require('../application/use-cases/auth/RecuperarContrasena');
const ListarCiudades = require('../application/use-cases/ciudades/ListarCiudades');
const CompletarPaciente = require('../application/use-cases/pacientes/CompletarPaciente');
const ListarPacientesPorUsuario = require('../application/use-cases/pacientes/ListarPacientesPorUsuario');
const ModificarPaciente = require('../application/use-cases/pacientes/ModificarPaciente');
const ObtenerMiPerfilPaciente = require('../application/use-cases/pacientes/ObtenerMiPerfilPaciente');
const ObtenerPaciente = require('../application/use-cases/pacientes/ObtenerPaciente');
const RegistrarPaciente = require('../application/use-cases/pacientes/RegistrarPaciente');
const RegistrarPacienteProvisional = require('../application/use-cases/pacientes/RegistrarPacienteProvisional');

const AsistenteController = require('../presentation/controllers/AsistenteController');
const ChatbotController   = require('../presentation/controllers/ChatbotController');
const DeudaController = require('../presentation/controllers/DeudaController');
const IngresoController = require('../presentation/controllers/IngresoController');
const ProductoController = require('../presentation/controllers/ProductoController');
const AuthController = require('../presentation/controllers/AuthController');
const AgendaController = require('../presentation/controllers/AgendaController');
const CitaController = require('../presentation/controllers/CitaController');
const CiudadController = require('../presentation/controllers/CiudadController');
const CompraController = require('../presentation/controllers/CompraController');
const DriveController = require('../presentation/controllers/DriveController');
const HistorialController = require('../presentation/controllers/HistorialController');
const PacienteController = require('../presentation/controllers/PacienteController');
const RecetaController = require('../presentation/controllers/RecetaController');
const ServicioController = require('../presentation/controllers/ServicioController');
const SuministroController = require('../presentation/controllers/SuministroController');
const TrasladoController = require('../presentation/controllers/TrasladoController');
const TratamientoController = require('../presentation/controllers/TratamientoController');
const CuentaController = require('../presentation/controllers/CuentaController');

const repositories = {
  agendaRepository: new AgendaRepository(),
  compraRepository: new CompraRepository(),
  deudaRepository: new DeudaRepository(),
  ingresoRepository: new IngresoRepository(),
  productoRepository: new ProductoRepository(),
  citaRepository: new CitaRepository(),
  ciudadRepository: new CiudadRepository(),
  historialRepository: new HistorialRepository(),
  pacienteRepository: new PacienteRepository(),
  recetaRepository: new RecetaRepository(),
  servicioRepository: new ServicioRepository(),
  suministroRepository: new SuministroRepository(),
  trasladoRepository: new TrasladoRepository(),
  tratamientoRepository: new TratamientoRepository(),
  usuarioRepository: new UsuarioRepository(),
  movimientoExtraRepository:    new MovimientoExtraRepository(),
  saldoInicialRepository:       new SaldoInicialRepository(),
  cuentaRepository:             new CuentaRepository(),
  sesionAsistenteRepository:    new SesionAsistenteRepository(),
  traspasoRepository:           new TraspasoRepository(),
  configClinicaRepository:      new ConfigClinicaRepository(),
};

const services = {
  driveService: new GoogleDriveService(),
  emailService: new EmailService(),
  hashService: new HashService(),
  tokenService: new JwtService(),
};

services.notificacionService = new NotificacionService(repositories.usuarioRepository);

const pacienteUseCases = {
  listarPacientesPorUsuario: new ListarPacientesPorUsuario(repositories.pacienteRepository),
  obtenerPaciente: new ObtenerPaciente(repositories.pacienteRepository),
  obtenerMiPerfilPaciente: new ObtenerMiPerfilPaciente(repositories.pacienteRepository),
  registrarPaciente: new RegistrarPaciente(
    repositories.pacienteRepository,
    repositories.historialRepository,
    repositories.ciudadRepository,
    repositories.usuarioRepository,
    services.hashService
  ),
  registrarPacienteProvisional: new RegistrarPacienteProvisional(
    repositories.pacienteRepository,
    repositories.ciudadRepository,
    services.hashService
  ),
  completarPaciente: new CompletarPaciente(
    repositories.pacienteRepository,
    repositories.ciudadRepository,
    repositories.usuarioRepository,
    services.hashService
  ),
  modificarPaciente: new ModificarPaciente(
    repositories.pacienteRepository,
    repositories.ciudadRepository,
    repositories.usuarioRepository,
    services.hashService
  ),
};

const authUseCases = {
  iniciarSesion: new IniciarSesion(
    repositories.usuarioRepository,
    services.hashService,
    services.tokenService
  ),
  recuperarContrasena: new RecuperarContrasena(
    repositories.usuarioRepository,
    services.hashService,
    services.emailService
  ),
  cerrarSesion: new CerrarSesion(),
};

const asistenteUseCases = {
  listarAsistentes: new ListarAsistentes(repositories.usuarioRepository),
  crearAsistente: new CrearAsistente(
    repositories.usuarioRepository,
    repositories.ciudadRepository,
    services.hashService
  ),
  modificarAsistente: new ModificarAsistente(
    repositories.usuarioRepository,
    repositories.ciudadRepository
  ),
  cambiarEstadoAsistente: new CambiarEstadoAsistente(repositories.usuarioRepository),
  cambiarPassword: new CambiarPassword(repositories.usuarioRepository, services.hashService),
};

const ciudadUseCases = {
  listarCiudades: new ListarCiudades(repositories.ciudadRepository),
};

module.exports = {
  authMiddleware,
  repositories,
  services,
  controllers: {
    agendaController: new AgendaController(repositories),
    asistenteController: new AsistenteController(asistenteUseCases),
    authController: new AuthController(authUseCases),
    citaController: new CitaController({ ...repositories, ...services }),
    ciudadController: new CiudadController(ciudadUseCases),
    compraController: new CompraController(repositories),
    deudaController: new DeudaController(repositories),
    ingresoController: new IngresoController(repositories),
    productoController: new ProductoController(repositories),
    driveController: new DriveController({ ...repositories, ...services }),
    historialController: new HistorialController(repositories),
    pacienteController: new PacienteController(pacienteUseCases),
    recetaController: new RecetaController(repositories),
    servicioController: new ServicioController(repositories),
    suministroController: new SuministroController(repositories),
    trasladoController: new TrasladoController(repositories),
    tratamientoController: new TratamientoController({ ...repositories, ...services }),
    cuentaController:    new CuentaController({ ...repositories }),
    chatbotController:   new ChatbotController(repositories),
  },
};
