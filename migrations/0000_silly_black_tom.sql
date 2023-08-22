CREATE TABLE `audiences` (
	`appId` text,
	`audienceId` text,
	`name` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`meta` blob NOT NULL,
	PRIMARY KEY(`appId`, `audienceId`)
);
--> statement-breakpoint
CREATE TABLE `flags` (
	`appId` text,
	`flagId` text,
	`name` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`meta` blob NOT NULL,
	PRIMARY KEY(`appId`, `flagId`)
);
