import UserBlock from '../models/UserBlockModel.js';
import User from '../models/UserModel.js';
import { notificationCreate } from '../controllers/NotificationController.js';

export const userBlock = async (req, res) => {
  const { blockerId } = req.body;
  const { blockedId } = req.params;
  if (blockerId === blockedId) {
    return res.status(400).json({ msg: 'Cannot block yourself' });
  }
  try {
    const blockedUser = await User.findByPk(blockedId);
    if (!blockedUser) return res.status(404).json({ msg: 'User not found' });
    const existing = await UserBlock.findOne({ where: { blockerId, blockedId } });
    if (existing) return res.status(400).json({ msg: 'User already blocked' });
    await UserBlock.create({ blockerId, blockedId });
    await notificationCreate(
      blockedId,
      'system',
      'You were blocked',
      'A user has blocked you.',
      null
    );
    res.status(201).json({ msg: 'User blocked' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const userUnblock = async (req, res) => {
  const { blockerId } = req.body;
  const { blockedId } = req.params;
  try {
    await UserBlock.destroy({ where: { blockerId, blockedId } });
    res.status(200).json({ msg: 'User unblocked' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const userBlocked = async (req, res) => {
  const { blockerId } = req.query;
  try {
    const blocks = await UserBlock.findAll({
      where: { blockerId },
      include: [{
        model: User,
        foreignKey: 'blockedId',
        attributes: ['UserID', 'UserFName', 'UserLName', 'UserName', 'UserImg']
      }]
    });
    res.status(200).json(blocks);
  } catch (error) {
    res.status(500).json(error);
  }
};
