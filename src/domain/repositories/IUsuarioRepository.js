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
}

module.exports = IUsuarioRepository;