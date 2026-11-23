import Notification from '../models/NotificationModel.js';

export const notificationList = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const notificationRead = async (req, res) => {
  const { notifId } = req.params;
  try {
    await Notification.update({ readAt: new Date() }, { where: { notifId } });
    res.status(200).json({ msg: 'Notification marked read' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const notificationCreate = async (userId, type, title, body, link) => {
  try {
    await Notification.create({ userId, type, title, body, link });
  } catch (error) {
    console.error('Notification create failed:', error);
  }
};
