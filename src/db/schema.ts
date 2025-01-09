import { index, int, primaryKey, mysqlTable, text, varchar, bigint, date, unique } from "drizzle-orm/mysql-core";

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

export const surveyPermissionsTable = mysqlTable("survey_permissions_table", {
    id: int().autoincrement().primaryKey(),
    surveyId: int().notNull().references(() => surveysTable.id, { onDelete: "cascade" }),
    user: int().references(() => usersTable.id, { onDelete: "cascade" }), // NULL means "any user"
    access: int().notNull(),
}, (table) => ({
    userIndex: index("user_index").on(table.user),
    surveyIndex: index("survey_index").on(table.surveyId),
    survey_user_un: unique("survey_user_un").on(table.surveyId, table.user),
}));
