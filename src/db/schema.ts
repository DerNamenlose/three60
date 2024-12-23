import { index, int, primaryKey, mysqlTable, text, varchar, bigint, date } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users_table", {
    id: int().autoincrement().primaryKey(),
    email: text().notNull().unique(),
    password_hash: text().notNull(),
    verification_code: varchar({ length: 255 }),
    verifcationCodeExpires: date(),
});

export const sessions = mysqlTable("sessions", {
    token: varchar({ length: 255 }).notNull().primaryKey(),
    userId: int().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    expires: bigint({ mode: "number" }).notNull(),
});

export const surveysTable = mysqlTable("surveys_table", {
    id: int().autoincrement().primaryKey(),
    title: text().notNull(),
    description: text(),
    owner: int().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
});

export const surveySkillsTable = mysqlTable("survey_skills_table", {
    id: int().autoincrement().primaryKey(),
    surveyId: int().notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
    title: text().notNull(),
    description: text(),
})

export const surveyAccessTable = mysqlTable("survey_access_table", {
    id: int().autoincrement().primaryKey(),
    surveyId: int().notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
    recepientEmail: text().notNull(),
    accessToken: varchar({ length: 255 }).notNull(),
}, (table) => ({
    tokenIndex: index("token_index").on(table.accessToken),
}));

export const surveyAnswersTable = mysqlTable("survey_answers_table", {
    participantId: int().notNull().references(() => surveyAccessTable.id, { onDelete: "cascade" }),
    skillId: int().notNull().references(() => surveySkillsTable.id, { onDelete: "cascade" }),
    rating: int().notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.participantId, table.skillId] }),
}));
