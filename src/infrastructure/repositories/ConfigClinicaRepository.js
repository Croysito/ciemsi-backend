const pool = require('../database/db');

class ConfigClinicaRepository {
  async findConfig() {
    const { rows } = await pool.query(
      'SELECT id, qr_drive_link, adelanto_monto FROM config_clinica WHERE id = 1'
    );
    return rows[0] ?? { id: 1, qr_drive_link: null, adelanto_monto: 50 };
  }

  async updateQrLink(driveLink) {
    await pool.query(
      'UPDATE config_clinica SET qr_drive_link = $1, updated_at = NOW() WHERE id = 1',
      [driveLink]
    );
  }
}

module.exports = ConfigClinicaRepository;
