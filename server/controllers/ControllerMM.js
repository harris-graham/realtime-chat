// import User from "../models/UserModel.js";
// import bcrypt from "bcryptjs";
// import { Sequelize } from "sequelize";

// export const entSelect = async (req, res) => {
//   try {
//     const ent = await Entity.findAll();
//     res.json(ent);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const entInsert = async (req, res) => {
//   const { entname } = req.body;
//   try {
//     await Entity.create({ EntName: entname });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const entUpdate = async (req, res) => {
//   const { entid } = req.params;
//   const { entname } = req.body;
//   try {
//     await Entity.update({ EntName: entname }, { where: { EntID: entid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const entDelete = async (req, res) => {
//   const { entid } = req.params;
//   try {
//     await Entity.destroy({ where: { EntID: entid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const locSelect = async (req, res) => {
//   Entity.hasMany(Location, { foreignKey: 'EntID' });
//   Location.belongsTo(Entity, { foreignKey: 'EntID' });
//   try {
//     const loc = await Location.findAll({ include: [Entity] });
//     res.json(loc);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const locInsert = async (req, res) => {
//   const { locname, loccolor, entid } = req.body;
//   try {
//     await Location.create({ LocName: locname, LocColor: loccolor, EntID: entid });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const locUpdate = async (req, res) => {
//   const { locid } = req.params;
//   const { locname, loccolor, entid } = req.body;
//   try {
//     await Location.update({ LocName: locname, LocColor: loccolor, EntID: entid }, { where: { LocID: locid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const locDelete = async (req, res) => {
//   const { locid } = req.params;
//   try {
//     await Location.destroy({ where: { LocID: locid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const matSelect = async (req, res) => {
//   try {
//     const mat = await Material.findAll();
//     res.json(mat);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const matUnuSelect = async (req, res) => {
//   Material.hasMany(RealEstate, { foreignKey: 'MatID' });
//   RealEstate.belongsTo(Material, { foreignKey: 'MatID' });
//   try {
//     const mat = await Material.findAll({ where: { '$realestates.MatID$': null }, include: [RealEstate] });
//     res.json(mat);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const matInsert = async (req, res) => {
//   const { matname, matprice, matimg } = req.body;
//   try {
//     await Material.create({ MatName: matname, MatPrice: matprice, MatImg: matimg });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const matUpdate = async (req, res) => {
//   const { matid } = req.params;
//   const { matname, matprice, matimg } = req.body;
//   try {
//     await Material.update({ MatName: matname, MatPrice: matprice, MatImg: matimg }, { where: { MatID: matid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const matDelete = async (req, res) => {
//   const { matid } = req.params;
//   try {
//     await Material.destroy({ where: { MatID: matid } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const resSelect = async (req, res) => {
//   Material.hasMany(RealEstate, { foreignKey: 'MatID' });
//   RealEstate.belongsTo(Material, { foreignKey: 'MatID' });
//   Location.hasMany(RealEstate, { foreignKey: 'LocID' });
//   RealEstate.belongsTo(Location, { foreignKey: 'LocID' });
//   try {
//     const rest = await RealEstate.findAll({ include: [Material, Location] });
//     res.json(rest);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const resInsert = async (req, res) => {
//   const { matid, locid, resqty } = req.body;
//   try {
//     const rescheck = await RealEstate.findAll({ where: { MatID: matid, LocID: locid } });
//     if (rescheck[0] == undefined) {
//       await RealEstate.create({ MatID: matid, LocID: locid, ResQty: resqty });
//     } else {
//       await RealEstate.update({ ResQty: Sequelize.literal(`ResQty + ${resqty}`) }, { where: { MatID: matid, LocID: locid } });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const transSelect = async (req, res) => {
//   Material.hasMany(Transfert, { foreignKey: 'MatID' });
//   Transfert.belongsTo(Material, { foreignKey: 'MatID' });
//   User.hasMany(Transfert, { foreignKey: 'UserID' });
//   Transfert.belongsTo(User, { foreignKey: 'UserID' });
//   try {
//     const trans = await Transfert.findAll({
//       attributes: {
//         include: [
//           [Sequelize.literal('(SELECT LocName FROM location WHERE location.LocID = transfert.LocSend)'), 'LocNameSend'],
//           [Sequelize.literal('(SELECT LocName FROM location WHERE location.LocID = transfert.LocRecip)'), 'LocNameRecip']
//         ]
//       }, include: [Material, User]
//     });
//     res.json(trans);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const transInsert = async (req, res) => {
//   const { transqty, matid, locsend, locrecip, uidact } = req.body;
//   try {
//     await Transfert.create({ TransQty: transqty, MatID: matid, LocSend: locsend, LocRecip: locrecip, UserID : uidact });
//     await RealEstate.update({ ResQty: Sequelize.literal(`ResQty - ${transqty}`) }, { where: { MatID: matid, LocID: locsend } });
//     const rescheck = await RealEstate.findAll({ where: { MatID: matid, LocID: locrecip } });
//     if (rescheck[0] == undefined) {
//       await RealEstate.create({ MatID: matid, LocID: locrecip, ResQty: transqty });
//     } else {
//       await RealEstate.update({ ResQty: Sequelize.literal(`ResQty + ${transqty}`) }, { where: { MatID: matid, LocID: locrecip } });
//     }
//     await RealEstate.destroy({ where: { ResQty: 0 } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const outSelect = async (req, res) => {
//   Material.hasMany(OutStock, { foreignKey: 'MatID' });
//   OutStock.belongsTo(Material, { foreignKey: 'MatID' });
//   Location.hasMany(OutStock, { foreignKey: 'LocID' });
//   OutStock.belongsTo(Location, { foreignKey: 'LocID' });
//   User.hasMany(OutStock, { foreignKey: 'UserID' });
//   OutStock.belongsTo(User, { foreignKey: 'UserID' });
//   try {
//     const out = await OutStock.findAll({ include: [Material, Location, User] });
//     res.json(out);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const outInsert = async (req, res) => {
//   const { outqty, outmotiv, matid, locid, uidact } = req.body;
//   try {
//     await OutStock.create({ OutQty: outqty, OutMotiv: outmotiv, MatID: matid, LocID: locid, UserID : uidact });
//     await RealEstate.update({ ResQty: Sequelize.literal(`ResQty - ${outqty}`) }, { where: { MatID: matid, LocID: locid } });
//     await RealEstate.destroy({ where: { ResQty: 0 } });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const userSelect = async (req, res) => {
//   User.hasMany(Transfert, { foreignKey: 'UserID' });
//   Transfert.belongsTo(User, { foreignKey: 'UserID' });
//   User.hasMany(OutStock, { foreignKey: 'UserID' });
//   OutStock.belongsTo(User, { foreignKey: 'UserID' });
//   try {
//     const user = await User.findAll({
//       attributes: {
//         include: [
//           [Sequelize.fn('COUNT', Sequelize.col('transferts.UserID')), 'UTCount'],
//           [Sequelize.fn('COUNT', Sequelize.col('outstocks.UserID')), 'UOCount']
//         ]
//       }, include: [Transfert, OutStock], group: ['user.UserID']
//     });
//     res.json(user);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// export const userInsert = async (req, res) => {
//   const { username, usertype, userpword } = req.body;
//   const salt = await bcrypt.genSalt();
//   const hashpword = await bcrypt.hash(userpword, salt);
//   try {
//     await User.create({ UserName: username, UserType: usertype, UserPword: hashpword });
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const userUpdate = async (req, res) => {
//   const { userid } = req.params;
//   const { username, userpword, usertype } = req.body;
//   try {
//     if (userpword == '') {
//       await User.update({ UserName: username, UserType: usertype }, { where: { UserID: userid } });
//     } else {
//       const salt = await bcrypt.genSalt();
//       const hashpword = await bcrypt.hash(userpword, salt);
//       await User.update({ UserName: username, UserPword: hashpword, UserType: usertype }, { where: { UserID: userid } });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const userDelete = async (req, res) => {
//   const { userid } = req.params;
//   try {
//     await User.destroy({ where: { UserID: userid } });
//   } catch (error) {
//     console.log(error);
//   }
// }