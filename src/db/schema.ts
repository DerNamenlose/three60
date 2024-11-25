import { index, int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),
    email: text().notNull().unique(),
    password_hash: text().notNull(),
});

export const sessions = sqliteTable("sessions", {
    token: text().notNull().primaryKey(),
    userId: int().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    expires: int().notNull(),
});

export const surveysTable = sqliteTable("surveys_table", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    description: text(),
    owner: int().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
});

export const surveySkillsTable = sqliteTable("survey_skills_table", {
    id: int().primaryKey({ autoIncrement: true }),
    surveyId: int().notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
    title: text().notNull(),
    description: text(),
})

export const surveyAccessTable = sqliteTable("survey_access_table", {
    id: int().primaryKey({ autoIncrement: true }),
    surveyId: int().notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
    recepientEmail: text().notNull(),
    accessToken: text().notNull(),
}, (table) => ({
    tokenIndex: index("token_index").on(table.accessToken),
}));

export const surveyAnswersTable = sqliteTable("survey_answers_table", {
    participantId: int().notNull().references(() => surveyAccessTable.id, { onDelete: "cascade" }),
    skillId: int().notNull().references(() => surveySkillsTable.id, { onDelete: "cascade" }),
    rating: int().notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.participantId, table.skillId] }),
}));