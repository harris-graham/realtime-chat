import { QueryTypes } from 'sequelize';
import db from '../config/Database.js';

export const dbHealth = async (req, res) => {
  try {
    await db.authenticate();
    const tables = await db.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;",
      { type: QueryTypes.SELECT }
    );
    res.status(200).json({
      dialect: 'postgres',
      connected: true,
      tables: tables.map((t) => t.tablename)
    });
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
};
