import { error } from "@sveltejs/kit";
import debug from "debug";

const log = debug('survey:admin:edit');

import { eq, or, and, inArray, gte, sql, isNull } from "drizzle-orm";
import { db } from "../db";
import { surveyAccessTable, surveyAnswersTable, surveyPermissionsTable, surveySkillsTable, surveysTable, usersTable } from "../db/schema";
import { AccessLevel, type AccessToken, type Email, type ParticipantId, type SkillId, type SurveyData, type SurveyId, type SurveyMetaData, type UserId } from "$lib/types";
import { checkAccess, whenAccess } from "$lib/helpers/shared/permissions";
import { generateRandomToken } from "$lib/helpers/shared/randomToken";

/**
 * Load the meta data for a single survey.
 * @param surveyId The survey ID to load
 * @param userId The ID of the user to load the survey for. This ensures proper access control
 * @returns The survey meta data or null if no such survey exists or the user doesn't have access
 */
export async function loadSurveyMetadata(surveyId: SurveyId, userId: UserId): Promise<SurveyMetaData | null> {
    const surveys = await db.select()
        .from(surveyPermissionsTable)
        .innerJoin(surveysTable, eq(surveysTable.id, surveyPermissionsTable.surveyId))
        .where(and(eq(surveysTable.id, surveyId), eq(surveyPermissionsTable.user, userId))).limit(1);

    if (surveys.length === 0) {
        return null;
    }

    return {
        id: surveys[0].surveys_table.id as SurveyId,
        title: surveys[0].surveys_table.title,
        description: surveys[0].surveys_table.description,
        permissions: surveys[0].survey_permissions_table.access as AccessLevel,
    }
}

/**
 * Load all permissions for a specific survey. This is different from the permissions field in a specific
 * survey for a specific user, which gives the permissions for _that specific user_. This call returns all
 * permissions for the survey and should only be available to owners.
 * 
 * @param surveyId The ID of the survey to load the permissions for
 */
export async function loadSurveyPermissions(surveyId: SurveyId) {
    let permissions = await db.select().from(surveyPermissionsTable).leftJoin(usersTable, eq(surveyPermissionsTable.user, usersTable.id)).where(eq(surveyPermissionsTable.surveyId, surveyId));
    return permissions.map(p => ({
        user: p.users_table ? {
            id: p.users_table.id as UserId,
            email: p.users_table.email as Email
        } : null,
        access: p.survey_permissions_table.access as AccessLevel
    }));
}

export async function loadMySurveys(userId: UserId): Promise<SurveyMetaData[]> {
    /// Get all surveys I have access to
    const mySurveys = await db.select()
        .from(surveyPermissionsTable)
        .innerJoin(surveysTable, eq(surveysTable.id, surveyPermissionsTable.surveyId))
        .where(or(eq(surveyPermissionsTable.user, userId), isNull(surveyPermissionsTable.user)));

    // deduplicate the results, always preferring the entry with the direct mention of the given user ID
    // Note: without the deduplications, surveys shared with "Anyone" would show up twice, if they were also shared directly with a user
    const deduplicatedResults = new Map<number, (typeof mySurveys)[0]>();
    for (const result of mySurveys) {
        const survey = deduplicatedResults.get(result.surveys_table.id);
        if (!survey?.survey_permissions_table.user) {
            deduplicatedResults.set(result.surveys_table.id, result);
        }
    }

    return [...deduplicatedResults.values().map(survey => ({
        id: survey.surveys_table.id as SurveyId,
        title: survey.surveys_table.title,
        description: survey.surveys_table.description,
        permissions: survey.survey_permissions_table.access,
    }))]
}

/**
 * Load the fill rates for the given surveys.
 * 
 * Note: This will ignore surveys in the input where the user doesn't have the appropriate access to see the fill rate.
 * @param surveys The surveys to load the fill rates for
 * @returns The surveys as before, but will the fill rates field filled, where appropriate.
 */
export async function loadSurveyFillRates(surveys: SurveyMetaData[]): Promise<SurveyMetaData[]> {
    const visibleSurveys = surveys.filter(survey => checkAccess(survey, AccessLevel.ReadResult)); // only ReadResult or above access allows users to see the fill rate
    const fillRates = await db.select({
        surveyId: surveyAccessTable.surveyId,
        filled: sql`count(distinct(${surveyAnswersTable.participantId}))`.mapWith(Number),
        expected: sql`count(distinct(${surveyAccessTable.id}))`.mapWith(Number),
    })
        .from(surveyAccessTable)
        .leftJoin(surveyAnswersTable, eq(surveyAccessTable.id, surveyAnswersTable.participantId))
        .groupBy(surveyAccessTable.surveyId)
        .where(inArray(surveyAccessTable.surveyId, visibleSurveys.map(survey => survey.id)));

    return surveys.map(survey => ({
        ...survey,
        fillRate: fillRates.find(fillRate => fillRate.surveyId === survey.id)
    })
    )
}

/**
 * Load a survey in the context of a specific user
 * @param id The ID of the survey in questions
 * @param userId The ID of the user for which to load the survey. This will ensure correct access to the survey.
 * @returns The data of the survey or null, if no such survey could be found (or the user doesn't have access to it)
 */
export async function loadSurvey(id: SurveyId, userId: UserId): Promise<SurveyData | null> {
    const survey = await loadSurveyMetadata(id, userId);

    if (!survey) {
        return null;
    }

    const participants = await whenAccess(survey, AccessLevel.Clone, () => db.select().from(surveyAccessTable).where(eq(surveyAccessTable.surveyId, id)));
    const skills = await whenAccess(survey, AccessLevel.Clone, () => db.select().from(surveySkillsTable).where(eq(surveySkillsTable.surveyId, id)));
    const answers = await whenAccess(survey, AccessLevel.ReadResult, () => {
        if (participants) {
            return db.select().from(surveyAnswersTable).where(inArray(surveyAnswersTable.participantId, participants.map(participant => participant.id)))
        }
        return null;
    });

    return {
        ...survey,
        participants: participants?.map(participant => ({
            id: participant.id as ParticipantId,
            email: participant.recepientEmail as Email,
            accessToken: whenAccess(survey, AccessLevel.Edit, () => participant.accessToken as AccessToken),
            answers: answers?.filter(answer => answer.participantId === participant.id).map(answer => ({
                skillId: answer.skillId as SkillId,
                rating: answer.rating / 10 // convert back to original vallue. The DB stores integer values only to prevent rounding and matching errors
            })) ?? []
        })) ?? [],
        skills: skills?.map(skill => ({
            id: skill.id as SkillId,
            title: skill.title,
            description: skill.description
        })) ?? []
    }
}

export async function loadSurveyData(surveyId: SurveyId, userId: UserId | null) {
    if (!userId) {
        log('User is not logged in');
        error(403, 'User is not logged in');
    }

    const surveyData = await loadSurvey(surveyId, userId);
    if (!surveyData) {
        log('Survey not found or user (%s) does not have access: %s', userId, surveyId);
        error(404, 'Survey not found');
    }
    return surveyData;
}

// add a new participant to a survey
export async function addParticipant(surveyId: SurveyId, recepientEmail: string) {
    await db.insert(surveyAccessTable).values({ surveyId, recepientEmail, accessToken: generateRandomToken() });
}

// add a new skill to a survey
export async function addSkill(surveyId: number, title: string, description: string) {
    await db.insert(surveySkillsTable).values({ surveyId, title, description });
}

/// Check whether a given user has at least the given access level to the given survey. This is based on a database query and doesn't need the survey object already to be loaded
export async function hasAccess(surveyId: number, userId: number, accessLevel: AccessLevel): Promise<boolean> {
    const result = await db.select().from(surveyPermissionsTable).where(
        and(
            eq(surveyPermissionsTable.surveyId, surveyId),
            or(
                eq(surveyPermissionsTable.user, userId),
                isNull(surveyPermissionsTable.user)
            ),
            gte(surveyPermissionsTable.access, accessLevel)));
    return result.length > 0;
}


/// A single entry in the permissions list
export type PermissionEntry = {
    user: UserId | null,
    access: AccessLevel
}

/// Atomically set the permissions for a given survey. This will clear the existing permissions and set the news ones in one transactions to prevent race conditions that could leave users without access to their survey
export async function setPermissions(surveyId: SurveyId, permissions: PermissionEntry[]) {
    const remainingUserIds = permissions.map(permission => permission.user);
    await db.transaction(async (tx) => {
        await tx.delete(surveyPermissionsTable).where(eq(surveyPermissionsTable.surveyId, surveyId));
        for (const permission of permissions) {
            await tx.insert(surveyPermissionsTable).values({ surveyId, user: permission.user, access: permission.access }).onDuplicateKeyUpdate({
                set: { access: permission.access }
            });
        }
    });
}

/// Grant access to to a given survey for a given user. If the user already has access, the access level will be updated
export async function grantAccess(surveyId: SurveyId, userId: UserId | null, accessLevel: AccessLevel) {
    await db.insert(surveyPermissionsTable).values({ surveyId, user: userId, access: accessLevel }).onDuplicateKeyUpdate({
        set: { access: accessLevel }
    });
}
