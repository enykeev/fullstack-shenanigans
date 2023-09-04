CREATE TABLE `apiKeys` (
	`appId` text NOT NULL,
	`apiKey` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL,
	`expiresAt` text NOT NULL
);
