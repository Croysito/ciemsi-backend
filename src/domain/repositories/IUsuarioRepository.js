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
}

module.exports = IUsuarioRepository;