CREATE TABLE `gameStatistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`categoryId` int NOT NULL,
	`totalGames` int NOT NULL DEFAULT 0,
	`totalCorrect` int NOT NULL DEFAULT 0,
	`totalQuestions` int NOT NULL DEFAULT 0,
	`fastestTimeSeconds` int,
	`averageTimeSeconds` int,
	`lastPlayedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameStatistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gameSessions` ADD `durationSeconds` int;