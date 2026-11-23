import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const MessageRead = db.define('message_read', {
  messageId: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  }
}, { freezeTableName: true, timestamps: true });

export default MessageRead;
