import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const GroupMember = db.define('group_member', {
  groupId: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  },
  role: {
    type: Sequelize.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member'
  }
}, { freezeTableName: true, timestamps: true });

export default GroupMember;
