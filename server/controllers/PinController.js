import Message from '../models/MessageModel.js';
import MessagePin from '../models/MessagePinModel.js';
import User from '../models/UserModel.js';
import { notificationCreate } from '../controllers/NotificationController.js';

export const messagePin = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;
  try {
    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    const existing = await MessagePin.findOne({ where: { messageId } });
    if (existing) return res.status(400).json({ msg: 'Message already pinned' });
    await MessagePin.create({ messageId, pinnedBy: userId });
    await notificationCreate(
      message.UserSend,
      'system',
      'Message pinned',
      'One of your messages was pinned.',
      null
    );
    res.status(201).json({ msg: 'Message pinned' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messageUnpin = async (req, res) => {
  const { messageId } = req.params;
  try {
    await MessagePin.destroy({ where: { messageId } });
    res.status(200).json({ msg: 'Message unpinned' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const messagePins = async (req, res) => {
  try {
    const pins = await MessagePin.findAll({
      include: [{
        model: Message,
        attributes: ['MessID', 'MessText', 'UserSend', 'createdAt']
      }, {
        model: User,
        foreignKey: 'pinnedBy',
        attributes: ['UserID', 'UserFName', 'UserLName', 'UserName']
      }]
    });
    res.status(200).json(pins);
  } catch (error) {
    res.status(500).json(error);
  }
};
