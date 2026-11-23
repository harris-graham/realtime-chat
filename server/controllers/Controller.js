import Chat from '../models/ChatModel.js';
import Invitation from '../models/InvitationModel.js';
import Message from '../models/MessageModel.js';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

export const chatIns = async (req, res) => {
  const { UserSend, UserRecip } = req.body;
  try {
    const res2 = await Chat.create({ UserSend, UserRecip });
    res.status(200).json(res2);
    await Invitation.destroy({ where: { UserSend, UserRecip } });
  } catch (error) {
    res.status(500).json(error);
  }
}

export const invitIns = async (req, res) => {
  const { UserSend, UserRecip } = req.body;
  try {
    const res2 = await Invitation.create({ UserSend, UserRecip });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const invitSelBySID = async (req, res) => {
  const { UserSend } = req.params;
  try {
    const res2 = await Invitation.findAll({
      attributes: {
        include: [
          [Sequelize.literal(`(SELECT UserImg FROM user WHERE UserID = invitation.UserRecip)`), 'UserImg'],
          [Sequelize.literal(`(SELECT UserFName FROM user WHERE UserID = invitation.UserRecip)`), 'UserFName'],
          [Sequelize.literal(`(SELECT UserLName FROM user WHERE UserID = invitation.UserRecip)`), 'UserLName']
        ]
      },
      where: { UserSend }, order: [Sequelize.col('invitation.createdAt')]
    });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const invitSelByRID = async (req, res) => {
  const { UserRecip } = req.params;
  try {
    const res2 = await Invitation.findAll({
      attributes: {
        include: [
          [Sequelize.literal(`(SELECT UserImg FROM user WHERE UserID = invitation.UserSend)`), 'UserImg'],
          [Sequelize.literal(`(SELECT UserFName FROM user WHERE UserID = invitation.UserSend)`), 'UserFName'],
          [Sequelize.literal(`(SELECT UserLName FROM user WHERE UserID = invitation.UserSend)`), 'UserLName']
        ]
      },
      where: { UserRecip }, order: [Sequelize.col('invitation.createdAt')]
    });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const invitDel = async (req, res) => {
  const { UserSend, UserRecip } = req.params;
  try {
    Invitation.destroy({ where: { UserSend, UserRecip } });
  } catch (error) {
    res.status(500).json(error);
  }
}

export const messIns = async (req, res) => {
  const { MessText, MessImg, UserSend, UserRecip, groupId, replyToId } = req.body;
  try {
    const res2 = await Message.create({ MessText, MessImg, UserSend, UserRecip, groupId, replyToId });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messSelByUID = async (req, res) => {
  const { UserSend, UserRecip } = req.params;
  try {
    const res2 = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [{ UserSend, UserRecip }, { UserSend: UserRecip, UserRecip: UserSend }]
      }, order: [Sequelize.col('message.createdAt')]
    });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const userIns = async (req, res) => {
  const { UserFName, UserLName, UserImg, UserName, userPword } = req.body;
  const UserType = 'User';
  const salt = await bcrypt.genSalt();
  const UserPword = await bcrypt.hash(userPword, salt);
  try {
    await User.create({ UserFName, UserLName, UserImg, UserType, UserName, UserPword });
  } catch (error) {
    res.status(500).json(error);
  }
}

export const userUpd = async (req, res) => {
  const { UserID } = req.params;
  const { UserFName, UserLName, UserImg, UserName, userPword } = req.body;
  try {
    if (userPword == '') {
      await User.update({ UserFName, UserLName, UserImg, UserName }, { where: { UserID } });
    } else {
      const salt = await bcrypt.genSalt();
      const UserPword = await bcrypt.hash(userPword, salt);
      await User.update({ UserFName, UserLName, UserImg, UserName, UserPword }, { where: { UserID } });
    }
  } catch (error) {
    res.status(500).json(error);
  }
}

export const userSelCByUID = async (req, res) => {
  const { UserID } = req.params;
  try {
    const res2 = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          { UserID: [Sequelize.literal(`(SELECT UserSend FROM chat WHERE UserRecip = '${UserID}')`)] },
          { UserID: [Sequelize.literal(`(SELECT UserRecip FROM chat WHERE UserSend = '${UserID}')`)] }
        ]
      }
    });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const userSelNCByUID = async (req, res) => {
  const { UserID } = req.params;
  try {
    const res2 = await User.findAll({
      attributes: {
        include: [
          [Sequelize.col('user.UserID'), 'UID'],
          [Sequelize.literal(`(SELECT COUNT(*) FROM user WHERE (UserID IN (SELECT UserSend FROM chat WHERE UserRecip = '${UserID}') OR UserID IN (SELECT UserRecip FROM chat WHERE UserSend = '${UserID}')) AND (UserID IN (SELECT UserSend FROM chat WHERE UserRecip = UID) OR UserID IN (SELECT UserRecip FROM chat WHERE UserSend = UID)))`), 'comChat']
        ]
      },
      where: {
        [Sequelize.Op.and]: [
          { UserID: { [Sequelize.Op.not]: [Sequelize.literal(`(SELECT UserSend FROM chat WHERE UserRecip = '${UserID}')`)] } },
          { UserID: { [Sequelize.Op.not]: [Sequelize.literal(`(SELECT UserRecip FROM chat WHERE UserSend = '${UserID}')`)] } },
          { UserID: { [Sequelize.Op.not]: [Sequelize.literal(`(SELECT UserSend FROM invitation WHERE UserRecip = '${UserID}')`)] } },
          { UserID: { [Sequelize.Op.not]: [Sequelize.literal(`(SELECT UserRecip FROM invitation WHERE UserSend = '${UserID}')`)] } },
          { UserID: { [Sequelize.Op.not]: UserID } }
        ]
      }
    });
    res.status(200).json(res2);
  } catch (error) {
    res.status(500).json(error);
  }
}