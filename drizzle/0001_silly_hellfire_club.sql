ALTER TABLE `users` ADD `authProvider` enum('manus','local','google','facebook','guest') DEFAULT 'manus' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);