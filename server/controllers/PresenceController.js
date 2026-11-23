import User from '../models/UserModel.js';

export const userPresence = async (req, res) => {
  const { userId, is_online, dnd } = req.body;
  try {
    const update = {};
    if (is_online !== undefined) update.is_online = is_online;
    if (dnd !== undefined) update.dnd = dnd;
    update.last_seen = new Date();
    await User.update(update, { where: { UserID: userId } });
    res.status(200).json({ msg: 'Presence updated' });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const userPresenceById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId, {
      attributes: ['UserID', 'UserName', 'is_online', 'dnd', 'last_seen']
    });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
