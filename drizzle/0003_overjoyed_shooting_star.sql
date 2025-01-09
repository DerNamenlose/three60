CREATE TABLE `survey_permissions_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`user` int,
	`access` int NOT NULL,
	CONSTRAINT `survey_permissions_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `survey_user_un` UNIQUE(`surveyId`,`user`)
);
--> statement-breakpoint
ALTER TABLE `survey_permissions_table` ADD CONSTRAINT `survey_permissions_table_surveyId_surveys_table_id_fk` FOREIGN KEY (`surveyId`) REFERENCES `surveys_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_permissions_table` ADD CONSTRAINT `survey_permissions_table_user_users_table_id_fk` FOREIGN KEY (`user`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_index` ON `survey_permissions_table` (`user`);--> statement-breakpoint
CREATE INDEX `survey_index` ON `survey_permissions_table` (`surveyId`);


-- Create the owner permission for each existing survey
INSERT INTO survey_permissions_table (surveyId, user, access) SELECT id,owner,255 FROM surveys_table;