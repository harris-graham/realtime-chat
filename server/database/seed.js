import db from '../config/Database.js';
import { User, Chat, Message, Invitation, GroupChat, GroupMember, MessageRead, MessageReaction, Notification, AuditLog } from '../models/index.js';

const seed = async () => {
  try {
    await db.sync({ force: true });

    const [u1] = await User.findOrCreate({
      where: { UserName: 'alice' },
      defaults: { UserFName: 'Alice', UserLName: 'Dupont', UserType: 'User', UserName: 'alice', UserPword: '$2a$10$placeholder', UserImg: '' }
    });
    const [u2] = await User.findOrCreate({
      where: { UserName: 'bob' },
      defaults: { UserFName: 'Bob', UserLName: 'Martin', UserType: 'User', UserName: 'bob', UserPword: '$2a$10$placeholder', UserImg: '' }
    });
    const [u3] = await User.findOrCreate({
      where: { UserName: 'carol' },
      defaults: { UserFName: 'Carol', UserLName: 'Lemoine', UserType: 'User', UserName: 'carol', UserPword: '$2a$10$placeholder', UserImg: '' }
    });

    await Chat.findOrCreate({ where: { UserSend: u1.UserID, UserRecip: u2.UserID } });
    await Chat.findOrCreate({ where: { UserSend: u2.UserID, UserRecip: u1.UserID } });

    const [g1] = await GroupChat.findOrCreate({
      where: { groupName: 'General' },
      defaults: { groupName: 'General', ownerId: u1.UserID }
    });
    await GroupMember.findOrCreate({ where: { groupId: g1.groupId, userId: u1.UserID } });
    await GroupMember.findOrCreate({ where: { groupId: g1.groupId, userId: u2.UserID } });
    await GroupMember.findOrCreate({ where: { groupId: g1.groupId, userId: u3.UserID } });

    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
