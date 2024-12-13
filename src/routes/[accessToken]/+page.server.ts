import { error, redirect } from '@sveltejs/kit';
import { db } from '../../db';
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from '../../db/schema';
import type { PageServerLoad } from './$types';

import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, url }) => {
    const results = await db.select()
        .from(surveyAccessTable)
        .where(eq(surveyAccessTable.accessToken, params.accessToken))
        .innerJoin(surveysTable, eq(surveysTable.id, surveyAccessTable.surveyId))
        .limit(1);

    if (results.length === 0) {
        error(404, 'Survey not found');
    }

    if (await db.$count(surveyAnswersTable, eq(surveyAnswersTable.participantId, results[0].survey_access_table.id)) > 0) {
        error(400, 'Answers already submitted');
    }

    const survey = results[0].surveys_table;

    const skills = await db.select().from(surveySkillsTable).where(eq(surveySkillsTable.surveyId, survey.id));

    return {
        title: survey.title,
        description: survey.description,
        skills: skills.map(skills => ({
            id: skills.id,
            title: skills.title,
            description: skills.description,
        }))
    }
}

export const actions = {
    default: async ({ request, params }) => {
        const results = await db.select()
            .from(surveyAccessTable)
            .where(eq(surveyAccessTable.accessToken, params.accessToken))
            .innerJoin(surveysTable, eq(surveysTable.id, surveyAccessTable.surveyId))
            .limit(1);

        if (results.length === 0) {
            error(404, 'Survey not found');
        }

        if (await db.$count(surveyAnswersTable, eq(surveyAnswersTable.participantId, results[0].survey_access_table.id)) > 0) {
            error(400, 'Answers already submitted');
        }

        const survey = results[0].surveys_table;
        const skills = await db.select().from(surveySkillsTable).where(eq(surveySkillsTable.surveyId, survey.id));

        const formData = await request.formData();
        // validate that the form doesn't contain invalid skill IDs
        const skillEntries = [...formData.entries()].filter(([key, _]) => key.startsWith('disable-'));
        const allIdsValid = skillEntries.every(([key, _]) => skills.some(skill => skill.id.toString() === key));
        if (!allIdsValid || skillEntries.length !== skills.length) {
            error(400, 'Invalid skill ID');
        }

        const answers = skillEntries.map(([key, value]) => ({
            participantId: results[0].survey_access_table.id,
            skillId: parseInt(key),
            rating: parseFloat(value.toString())
        }));
        if (answers.some(answer => isNaN(answer.rating) || answer.rating < 0 || answer.rating > 3)) {
            error(400, 'Invalid answer');
        }
        await db.insert(surveyAnswersTable).values([...answers]);

        redirect(303, `/${params.accessToken}/thanks`);
    }
}