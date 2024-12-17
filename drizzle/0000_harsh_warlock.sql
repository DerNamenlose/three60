CREATE TABLE `sessions` (
	`token` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`expires` bigint NOT NULL,
	CONSTRAINT `sessions_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
CREATE TABLE `survey_access_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`recepientEmail` text NOT NULL,
	`accessToken` varchar(255) NOT NULL,
	CONSTRAINT `survey_access_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_answers_table` (
	`participantId` int NOT NULL,
	`skillId` int NOT NULL,
	`rating` int NOT NULL,
	CONSTRAINT `survey_answers_table_participantId_skillId_pk` PRIMARY KEY(`participantId`,`skillId`)
);
--> statement-breakpoint
CREATE TABLE `survey_skills_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	CONSTRAINT `survey_skills_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveys_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`owner` int NOT NULL,
	CONSTRAINT `surveys_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_table_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_table_id_fk` FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_access_table` ADD CONSTRAINT `survey_access_table_surveyId_surveys_table_id_fk` FOREIGN KEY (`surveyId`) REFERENCES `surveys_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_answers_table` ADD CONSTRAINT `survey_answers_table_participantId_survey_access_table_id_fk` FOREIGN KEY (`participantId`) REFERENCES `survey_access_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_answers_table` ADD CONSTRAINT `survey_answers_table_skillId_survey_skills_table_id_fk` FOREIGN KEY (`skillId`) REFERENCES `survey_skills_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_skills_table` ADD CONSTRAINT `survey_skills_table_surveyId_surveys_table_id_fk` FOREIGN KEY (`surveyId`) REFERENCES `surveys_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `surveys_table` ADD CONSTRAINT `surveys_table_owner_users_table_id_fk` FOREIGN KEY (`owner`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `token_index` ON `survey_access_table` (`accessToken`);
