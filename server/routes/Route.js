import express from 'express';
import { Login, Logout } from '../controllers/Auth.js';
import {
  chatIns, invitIns, invitSelBySID, invitSelByRID, invitDel,
  messIns, messSelByUID, userIns, userSelCByUID, userSelNCByUID, userUpd
} from '../controllers/Controller.js';
import { refreshToken } from '../controllers/RefreshToken.js';
import {
  groupCreate, groupList, groupJoin, groupLeave, groupMembers, groupMessages
} from '../controllers/GroupController.js';
import {
  messageRead, messageReaders, messageReaction, messageReactions,
  messageEdit, messageDelete, searchMessages, messageMentions
} from '../controllers/MessageController.js';
import {
  notificationList, notificationRead
} from '../controllers/NotificationController.js';
import { dbHealth } from '../controllers/DbController.js';
import {
  messagePin, messageUnpin, messagePins
} from '../controllers/PinController.js';
import {
  userBlock, userUnblock, userBlocked
} from '../controllers/BlockController.js';
import {
  userPresence, userPresenceById
} from '../controllers/PresenceController.js';

const router = express.Router();

router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.get('/db/health', dbHealth);
router.post('/chatIns', chatIns);
router.post('/invitIns', invitIns);
router.get('/invitSelBySID/:UserSend', invitSelBySID);
router.get('/invitSelByRID/:UserRecip', invitSelByRID);
router.delete('/invitDel/:UserSend/:UserRecip', invitDel);
router.post('/messIns', messIns);
router.get('/messSelByUID/:UserSend/:UserRecip', messSelByUID);
router.post('/userIns', userIns);
router.get('/userSelCByUID/:UserID', userSelCByUID);
router.get('/userSelNCByUID/:UserID', userSelNCByUID);
router.put('/userUpd/:UserID', userUpd);

router.post('/groupCreate', groupCreate);
router.get('/groupList/:userId', groupList);
router.post('/groupJoin', groupJoin);
router.delete('/groupLeave/:groupId/:userId', groupLeave);
router.get('/groupMembers/:groupId', groupMembers);
router.get('/groupMessages/:groupId', groupMessages);

router.post('/messageRead', messageRead);
router.get('/messageReaders/:messageId', messageReaders);
router.post('/messageReaction', messageReaction);
router.get('/messageReactions/:messageId', messageReactions);
router.put('/messageEdit/:messageId', messageEdit);
router.delete('/messageDelete/:messageId', messageDelete);
router.get('/searchMessages', searchMessages);
router.get('/message/mentions/:userId', messageMentions);

router.post('/message/pin/:messageId', messagePin);
router.delete('/message/pin/:messageId', messageUnpin);
router.get('/message/pins', messagePins);

router.post('/user/block/:blockedId', userBlock);
router.delete('/user/block/:blockedId', userUnblock);
router.get('/user/blocked', userBlocked);

router.put('/user/presence', userPresence);
router.get('/user/presence/:userId', userPresenceById);

router.get('/notificationList/:userId', notificationList);
router.put('/notificationRead/:notifId', notificationRead);

export default router;
