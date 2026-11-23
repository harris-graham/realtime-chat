import GroupChat from '../models/GroupChatModel.js';
import GroupMember from '../models/GroupMemberModel.js';
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';
import Notification from '../models/NotificationModel.js';
import { Sequelize } from 'sequelize';

export const groupCreate = async (req, res) => {
  const { groupName, userId } = req.body;
  try {
    const group = await GroupChat.create({ groupName, ownerId: userId });
    await GroupMember.create({ groupId: group.groupId, userId: userId, role: 'admin' });
    await Notification.create({
      userId,
      type: 'system',
      title: 'Group created',
      body: `You created the group "${groupName}".`,
      link: `/group/${group.groupId}`
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const groupList = async (req, res) => {
  const { userId } = req.params;
  try {
    const groups = await GroupChat.findAll({
      attributes: ['groupId', 'groupName', 'ownerId', 'createdAt'],
      include: [{
        model: GroupMember,
        where: { userId },
        attributes: ['role']
      }]
    });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const groupJoin = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    await GroupMember.create({ groupId, userId, role: 'member' });
    res.status(200).json({ msg: 'Joined group' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const groupLeave = async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    await GroupMember.destroy({ where: { groupId, userId } });
    res.status(200).json({ msg: 'Left group' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const groupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{
        model: User,
        attributes: ['UserID', 'UserFName', 'UserLName', 'UserImg', 'UserName']
      }]
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const groupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await Message.findAll({
      where: { groupId, deletedAt: null },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};
