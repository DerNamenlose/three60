import { error } from '@sveltejs/kit';
import { db } from '../../db';
import { surveyAccessTable, surveyAnswersTable, surveysTable } from '../../db/schema';
import type { PageServerLoad } from './$types';

import { eq, inArray, not, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.userId) {
        error(403, 'User is not logged in');
    }
    const mySurveys = await db.select().from(surveysTable).where(eq(surveysTable.owner, locals.userId));
    const fillRates = await db.select({
        surveyId: surveyAccessTable.surveyId,
        filled: sql`count(distinct(${surveyAnswersTable.participantId}))`.mapWith(Number),
        expected: sql`count(distinct(${surveyAccessTable.id}))`.mapWith(Number),
    })
        .from(surveyAccessTable)
        .leftJoin(surveyAnswersTable, eq(surveyAccessTable.id, surveyAnswersTable.participantId))
        .groupBy(surveyAccessTable.surveyId);

    return {
        surveys: mySurveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            description: survey.description,
            fillRate: {
                filled: fillRates.find(fillRate => fillRate.surveyId === survey.id)?.filled ?? 0,
                expected: fillRates.find(fillRate => fillRate.surveyId === survey.id)?.expected ?? 0
            }
        }))
    }
}