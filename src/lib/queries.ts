import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from "../db/schema";

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
                rating: answer.rating
            }))
        })),
        skills: skills.map(skill => ({
            id: skill.id,
            title: skill.title,
            description: skill.description
        }))
    }
}