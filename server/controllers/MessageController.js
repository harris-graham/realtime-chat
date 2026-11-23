import Message from '../models/MessageModel.js';
import MessageRead from '../models/MessageReadModel.js';
import MessageReaction from '../models/MessageReactionModel.js';
import User from '../models/UserModel.js';
import { Sequelize } from 'sequelize';

export const messageRead = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    await MessageRead.findOrCreate({ where: { messageId, userId } });
    res.status(200).json({ msg: 'Marked read' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageReaders = async (req, res) => {
  const { messageId } = req.params;
  try {
    const readers = await MessageRead.findAll({
      where: { messageId },
      include: [{
        model: User,
        attributes: ['UserID', 'UserFName', 'UserLName', 'UserImg']
      }]
    });
    res.status(200).json(readers);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageReaction = async (req, res) => {
  const { messageId, userId, emoji } = req.body;
  try {
    await MessageReaction.findOrCreate({ where: { messageId, userId, emoji } });
    res.status(200).json({ msg: 'Reaction added' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageReactions = async (req, res) => {
  const { messageId } = req.params;
  try {
    const reactions = await MessageReaction.findAll({
      where: { messageId },
      include: [{
        model: User,
        attributes: ['UserID', 'UserFName', 'UserLName', 'UserImg']
      }]
    });
    res.status(200).json(reactions);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageEdit = async (req, res) => {
  const { messageId } = req.params;
  const { MessText, userId } = req.body;
  try {
    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.UserSend !== userId) return res.status(403).json({ msg: 'Not authorized' });
    await Message.update({ MessText, editedAt: new Date() }, { where: { MessID: messageId } });
    res.status(200).json({ msg: 'Message edited' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageDelete = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;
  try {
    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.UserSend !== userId) return res.status(403).json({ msg: 'Not authorized' });
    await Message.update({ deletedAt: new Date() }, { where: { MessID: messageId } });
    res.status(200).json({ msg: 'Message deleted' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const searchMessages = async (req, res) => {
  const { userId, q } = req.query;
  try {
    const messages = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [
          { UserSend: userId },
          { UserRecip: userId }
        ],
        MessText: { [Sequelize.Op.like]: `%${q}%` },
        deletedAt: null
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageMentions = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId, { attributes: ['UserName'] });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const messages = await Message.findAll({
      where: {
        MessText: { [Sequelize.Op.like]: `%@${user.UserName}%` },
        deletedAt: null
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};
