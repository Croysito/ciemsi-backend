class AgregarLink {
  constructor(historialRepository) {
    this.historialRepository = historialRepository;
  }

  async execute({ notaId, nombre, link, tipo }) {
    // 1. Validar tipo
    const tiposValidos = ['IMAGEN', 'VIDEO', 'DRIVE'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo de link no válido. Use: IMAGEN, VIDEO o DRIVE');
    }

    // 2. Validar que el link sea una URL válida
    try {
      new URL(link);
    } catch {
      throw new Error('El link no es una URL válida');
    }

    // 3. Agregar el link
    const nuevoLink = await this.historialRepository.addLink({
      nombre,
      link,
      tipo,
      notaId,
    });

    return { mensaje: 'Link agregado correctamente', link: nuevoLink };
  }
}

module.exports = AgregarLink;