import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const MessagePin = db.define('message_pin', {
  pinId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  messageId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  pinnedBy: {
    type: Sequelize.UUID,
    allowNull: false
  }
}, { freezeTableName: true, timestamps: true });

export default MessagePin;
