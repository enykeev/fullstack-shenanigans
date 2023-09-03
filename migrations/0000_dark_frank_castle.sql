CREATE TABLE `audiences` (
	`appId` text NOT NULL,
	`audienceId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`meta` blob NOT NULL,
	PRIMARY KEY(`appId`, `audienceId`)
);
--> statement-breakpoint
CREATE TABLE `flags` (
	`appId` text NOT NULL,
	`flagId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`meta` blob NOT NULL,
	PRIMARY KEY(`appId`, `flagId`)
);
--> statement-breakpoint
CREATE TABLE `overrides` (
	`appId` text NOT NULL,
	`overrideId` text NOT NULL,
	`flagId` text NOT NULL,
	`audienceId` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`meta` blob NOT NULL,
	PRIMARY KEY(`appId`, `overrideId`)
);
