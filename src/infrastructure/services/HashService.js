const bcrypt = require('bcryptjs');

class HashService {
  async hashear(texto) {
    return await bcrypt.hash(texto, 10);
  }

  async comparar(texto, hash) {
    return await bcrypt.compare(texto, hash);
  }
}

module.exports = HashService;