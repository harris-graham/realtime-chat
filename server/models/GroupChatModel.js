import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const GroupChat = db.define('group_chat', {
  groupId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  groupName: {
    type: Sequelize.CHAR(100),
    allowNull: false
  },
  ownerId: {
    type: Sequelize.CHAR(36),
    allowNull: false
  }
}, { freezeTableName: true, timestamps: true });

export default GroupChat;
