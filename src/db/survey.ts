import { error } from "@sveltejs/kit";
import debug from "debug";

const log = debug('survey:admin:edit');

import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from "../db/schema";
import { generateRandomToken } from "$lib/randomToken";

export async function loadSurvey(id: number, ownerId: number) {
    const survey = await db.select().from(surveysTable).where(and(eq(surveysTable.id, id), eq(surveysTable.owner, ownerId))).limit(1);
    const participants = await db.select().from(surveyAccessTable).where(eq(surveyAccessTable.surveyId, id));
    const skills = await db.select().from(surveySkillsTable).where(eq(surveySkillsTable.surveyId, id));
    const answers = await db.select().from(surveyAnswersTable).where(inArray(surveyAnswersTable.participantId, participants.map(participant => participant.id)));

    if (survey.length === 0) {
        return null;
    }

    return {
        id,
        title: survey[0].title,
        description: survey[0].description,
        participants: participants.map(participant => ({
            id: participant.id,
            email: participant.recepientEmail,
            accessToken: participant.accessToken,
            answers: answers.filter(answer => answer.participantId === participant.id).map(answer => ({
                skillId: answer.skillId,
                rating: answer.rating / 10 // convert back to original vallue. The DB stores integer values only to prevent rounding and matching errors
            }))
        })),
        skills: skills.map(skill => ({
            id: skill.id,
            title: skill.title,
            description: skill.description
        }))
    }
}

export async function loadSurveyData(surveyId: string, userId: number | null) {
    const sId = parseInt(surveyId);

    if (isNaN(sId)) {
        log('Invalid survey ID %s', surveyId);
        error(404, 'Invalid survey ID');
    }
    if (!userId) {
        log('User is not logged in');
        error(403, 'User is not logged in');
    }

    const surveyData = await loadSurvey(sId, userId);
    if (!surveyData) {
        log('Survey not found or user (%s) does not have access: %s', userId, surveyId);
        error(404, 'Survey not found');
    }
    return surveyData;
}

// add a new participant to a survey
export async function addParticipant(surveyId: number, recepientEmail: string) {
    await db.insert(surveyAccessTable).values({ surveyId, recepientEmail, accessToken: generateRandomToken() });
}

// add a new skill to a survey
export async function addSkill(surveyId: number, title: string, description: string) {
    await db.insert(surveySkillsTable).values({ surveyId, title, description });
}