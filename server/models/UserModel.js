import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const User = db.define('user', {
  UserID: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  UserFName: {
    type: Sequelize.CHAR(25),
    allowNull: false
  },
  UserLName: {
    type: Sequelize.CHAR(35),
    allowNull: false
  },
  UserImg: { type: Sequelize.TEXT },
  UserType: {
    type: Sequelize.CHAR(5),
    allowNull: false
  },
  UserName: {
    type: Sequelize.CHAR(20),
    allowNull: false,
    unique: true
  },
  UserPword: {
    type: Sequelize.CHAR(60),
    allowNull: false
  },
  refreshToken: { type: Sequelize.TEXT },
  last_seen: { type: Sequelize.DATE, allowNull: true },
  is_online: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  dnd: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
}, { freezeTableName: true });

(async () => {
  await db.sync();
})();

export default User;