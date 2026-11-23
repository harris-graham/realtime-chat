-- Realtime Chat database schema (PostgreSQL)
-- Create the database first: createdb chat_db
-- Run: psql -U postgres -d chat_db -f server/database/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS message_reaction;
DROP TABLE IF EXISTS message_read;
DROP TABLE IF EXISTS group_member;
DROP TABLE IF EXISTS group_chat;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS message_pin;
DROP TABLE IF EXISTS user_block;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS chat;
DROP TABLE IF EXISTS invitation;
DROP TABLE IF EXISTS "user";

CREATE TABLE "user" (
  UserID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  UserFName VARCHAR(25) NOT NULL,
  UserLName VARCHAR(35) NOT NULL,
  UserImg TEXT,
  UserType VARCHAR(5) NOT NULL DEFAULT 'User',
  UserName VARCHAR(20) NOT NULL UNIQUE,
  UserPword VARCHAR(60) NOT NULL,
  refreshToken TEXT,
  last_seen TIMESTAMP,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  dnd BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat (
  UserSend UUID NOT NULL,
  UserRecip UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserSend, UserRecip),
  FOREIGN KEY (UserSend) REFERENCES "user"(UserID),
  FOREIGN KEY (UserRecip) REFERENCES "user"(UserID)
);

CREATE TABLE message (
  MessID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  MessText TEXT,
  MessImg TEXT,
  UserSend UUID NOT NULL,
  UserRecip UUID NOT NULL,
  groupId UUID,
  replyToId UUID,
  type VARCHAR(10) NOT NULL DEFAULT 'text',
  editedAt TIMESTAMP,
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserSend) REFERENCES "user"(UserID),
  FOREIGN KEY (UserRecip) REFERENCES "user"(UserID),
  FOREIGN KEY (groupId) REFERENCES group_chat(groupId),
  FOREIGN KEY (replyToId) REFERENCES message(MessID)
);

CREATE TABLE invitation (
  UserSend UUID NOT NULL,
  UserRecip UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserSend, UserRecip),
  FOREIGN KEY (UserSend) REFERENCES "user"(UserID),
  FOREIGN KEY (UserRecip) REFERENCES "user"(UserID)
);

CREATE TABLE group_chat (
  groupId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupName VARCHAR(100) NOT NULL,
  ownerId UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES "user"(UserID)
);

CREATE TABLE group_member (
  groupId UUID NOT NULL,
  userId UUID NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'member',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (groupId, userId),
  FOREIGN KEY (groupId) REFERENCES group_chat(groupId),
  FOREIGN KEY (userId) REFERENCES "user"(UserID)
);

CREATE TABLE message_read (
  messageId UUID NOT NULL,
  userId UUID NOT NULL,
  readAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (messageId, userId),
  FOREIGN KEY (messageId) REFERENCES message(MessID),
  FOREIGN KEY (userId) REFERENCES "user"(UserID)
);

CREATE TABLE message_reaction (
  reactionId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messageId UUID NOT NULL,
  userId UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (messageId) REFERENCES message(MessID),
  FOREIGN KEY (userId) REFERENCES "user"(UserID),
  UNIQUE (messageId, userId, emoji)
);

CREATE TABLE message_pin (
  pinId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messageId UUID NOT NULL,
  pinnedBy UUID NOT NULL,
  pinnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (messageId) REFERENCES message(MessID),
  FOREIGN KEY (pinnedBy) REFERENCES "user"(UserID),
  UNIQUE (messageId)
);

CREATE TABLE user_block (
  blockerId UUID NOT NULL,
  blockedId UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blockerId, blockedId),
  FOREIGN KEY (blockerId) REFERENCES "user"(UserID),
  FOREIGN KEY (blockedId) REFERENCES "user"(UserID)
);

CREATE TABLE notification (
  notifId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  readAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "user"(UserID)
);

CREATE TABLE audit_log (
  logId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entityId UUID,
  meta TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "user"(UserID)
);

CREATE INDEX idx_message_user_recip ON message(UserRecip);
CREATE INDEX idx_message_group ON message(groupId);
CREATE INDEX idx_message_created ON message(createdAt);
CREATE INDEX idx_notification_user ON notification(userId);
CREATE INDEX idx_notification_read ON notification(readAt);
CREATE INDEX idx_user_block_blocked ON user_block(blockedId);
