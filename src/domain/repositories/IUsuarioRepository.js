class IUsuarioRepository {
  // Buscar usuario por email para el login
  async findByEmail(email) {
    throw new Error('Método findByEmail() no implementado');
  }

  // Buscar usuario por id
  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  // Actualizar contraseña (recuperación)
  async updatePassword(id, hashedPassword) {
    throw new Error('Método updatePassword() no implementado');
  }
  async create({ nombre, apellido, email, password, rolId }) {
    throw new Error('Método create() no implementado');
  }
    async findByRol(rolId) {
    throw new Error('Método findByRol() no implementado');
  }
  async create({ nombre, apellido, email, password, rolId, ciudadId }) {
    throw new Error('Método create() no implementado');
  }

  async update(id, { nombre, apellido, email, ciudadId }) {
    throw new Error('Método update() no implementado');
  }

  async updatePassword(id, hashedPassword) {
    throw new Error('Método updatePassword() no implementado');
  }

  async updateEstado(id, estado) {
    throw new Error('Método updateEstado() no implementado');
  }
  async updateFcmToken(id, fcmToken) {
  throw new Error('Método updateFcmToken() no implementado');
}

async getFcmTokensByRol(rolId) {
  throw new Error('Método getFcmTokensByRol() no implementado');
}

async getFcmTokensByCiudadYRol(ciudadId, rolId) {
  throw new Error('Método getFcmTokensByCiudadYRol() no implementado');
}

async getFcmTokenById(id) {
  throw new Error('Método getFcmTokenById() no implementado');
}
}

module.exports = IUsuarioRepository;