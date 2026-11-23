import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Message = db.define('message', {
  MessID: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  MessText: {
    type: Sequelize.TEXT
  },
  MessImg: {
    type: Sequelize.TEXT
  },
  UserSend: {
    type: Sequelize.CHAR(36),
    allowNull: false
  },
  UserRecip: {
    type: Sequelize.CHAR(36),
    allowNull: false
  },
  groupId: {
    type: Sequelize.CHAR(36)
  },
  replyToId: {
    type: Sequelize.CHAR(36)
  },
  type: {
    type: Sequelize.ENUM('text', 'image', 'file', 'system'),
    allowNull: false,
    defaultValue: 'text'
  },
  editedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  deletedAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, { freezeTableName: true, timestamps: true });

export default Message;
