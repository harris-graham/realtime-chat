import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const MessageReaction = db.define('message_reaction', {
  reactionId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  messageId: {
    type: Sequelize.CHAR(36),
    allowNull: false
  },
  userId: {
    type: Sequelize.CHAR(36),
    allowNull: false
  },
  emoji: {
    type: Sequelize.CHAR(10),
    allowNull: false
  }
}, { freezeTableName: true, timestamps: true });

export default MessageReaction;
