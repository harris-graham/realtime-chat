import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const UserBlock = db.define('user_block', {
  blockerId: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },
  blockedId: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  }
}, { freezeTableName: true, timestamps: true });

export default UserBlock;
