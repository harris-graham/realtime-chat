import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Notification = db.define('notification', {
  notifId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.CHAR(36),
    allowNull: false
  },
  type: {
    type: Sequelize.ENUM('invitation', 'message', 'reaction', 'mention', 'system'),
    allowNull: false
  },
  title: {
    type: Sequelize.CHAR(200),
    allowNull: false
  },
  body: {
    type: Sequelize.TEXT
  },
  link: {
    type: Sequelize.CHAR(500)
  },
  readAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, { freezeTableName: true, timestamps: true });

export default Notification;
