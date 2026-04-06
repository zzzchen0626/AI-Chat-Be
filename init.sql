CREATE DATABASE IF NOT EXISTS aiChat;
USE aiChat;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `nickName` varchar(256) NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat` (
  `id` varchar(36) NOT NULL,
  `title` varchar(256) DEFAULT 'New Chat',
  `isActive` tinyint NOT NULL DEFAULT 1,
  `userId` int NOT NULL,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_chat_userId` (`userId`),
  CONSTRAINT `FK_chat_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `message` (
  `id` varchar(36) NOT NULL,
  `role` enum('user','system','assistant') NOT NULL DEFAULT 'user',
  `content` text NOT NULL,
  `imgUrl` json DEFAULT NULL,
  `fileContent` json DEFAULT NULL,
  `chatId` varchar(36) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_message_chatId` (`chatId`),
  CONSTRAINT `FK_message_chatId` FOREIGN KEY (`chatId`) REFERENCES `chat` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `file_entity` (
  `id` varchar(36) NOT NULL,
  `fileId` varchar(256) NOT NULL,
  `filePath` varchar(255) DEFAULT NULL,
  `totalChunks` int NOT NULL DEFAULT 0,
  `isCompleted` tinyint NOT NULL DEFAULT 0,
  `isCanceled` tinyint NOT NULL DEFAULT 0,
  `chatId` varchar(36) DEFAULT NULL,
  `uploadedChunks` int NOT NULL DEFAULT 0,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_file_entity_chatId` (`chatId`),
  CONSTRAINT `FK_file_entity_chatId` FOREIGN KEY (`chatId`) REFERENCES `chat` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
