import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Invitation = db.define('invitation', {
  UserSend: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  },
  UserRecip: {
    type: Sequelize.CHAR(36),
    allowNull: false,
    primaryKey: true
  }
}, { freezeTableName: true });

(async () => {
  await db.sync();
})();

export default Invitation;