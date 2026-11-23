import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const AuditLog = db.define('audit_log', {
  logId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.CHAR(36),
    allowNull: true
  },
  action: {
    type: Sequelize.CHAR(100),
    allowNull: false
  },
  entity: {
    type: Sequelize.CHAR(50),
    allowNull: false
  },
  entityId: {
    type: Sequelize.CHAR(36)
  },
  meta: {
    type: Sequelize.TEXT
  }
}, { freezeTableName: true, timestamps: true });

export default AuditLog;
