ALTER TABLE `users` ADD `emailProvider` enum('smtp','gmail_oauth','outlook_oauth') DEFAULT 'smtp';--> statement-breakpoint
ALTER TABLE `users` ADD `oauth2AccessToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `oauth2RefreshToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `oauth2TokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `oauth2Email` varchar(320);