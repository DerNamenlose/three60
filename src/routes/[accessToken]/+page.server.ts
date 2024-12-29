import { error, redirect } from '@sveltejs/kit';
import { db } from '../../db';
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from '../../db/schema';
import type { PageServerLoad } from './$types';

import { eq } from 'drizzle-orm';

import debug from 'debug';

const log_load = debug('survey:load');
const log_store = debug('survey:store');

export const load: PageServerLoad = async ({ params, url }) => {
    const results = await db.select()
        .from(surveyAccessTable)
        .where(eq(surveyAccessTable.accessToken, params.accessToken))
        .innerJoin(surveysTable, eq(surveysTable.id, surveyAccessTable.surveyId))
        .limit(1);

    if (results.length === 0) {
        log_load('Survey not found: %s', params.accessToken);
        error(404, 'Survey not found');
    }

    if (await db.$count(surveyAnswersTable, eq(surveyAnswersTable.participantId, results[0].survey_access_table.id)) > 0) {
        log_load('Answers already submitted: %s', params.accessToken);
        error(400, 'You have already submitted your answers. If you feel that this is wrong, please contact the survey creator to reset your answers.');
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
            log_store('Survey not found: %s', params.accessToken);
            error(404, 'Survey not found');
        }

        if (await db.$count(surveyAnswersTable, eq(surveyAnswersTable.participantId, results[0].survey_access_table.id)) > 0) {
            log_store('Answers already submitted: %s', params.accessToken);
            error(400, 'You have already submitted your answers. If you feel that this is wrong, please contact the survey creator to reset your answers.');
        }

        const survey = results[0].surveys_table;
        const skills = await db.select().from(surveySkillsTable).where(eq(surveySkillsTable.surveyId, survey.id));

        const formData = await request.formData();
        // validate that the form doesn't contain invalid skill IDs
        const skillEntries = [...formData.entries()].filter(([key, _]) => !key.startsWith('disable-'));
        const allIdsValid = skillEntries.every(([key, _]) => skills.some(skill => skill.id.toString() === key));
        const deselectedIds = [...formData.entries().filter(([key, _]) => key.startsWith('disable-')).map(([key, _]) => parseInt(key.replace('disable-', '')))];
        if (!allIdsValid || skillEntries.length + deselectedIds.length !== skills.length) {
            let missing_ids = skills.filter(skill => !skillEntries.some(([key, _]) => key === skill.id.toString()) && !deselectedIds.includes(skill.id));
            let invalid_ids = skillEntries.filter(([key, _]) => !skills.some(skill => skill.id.toString() === key)).map(([key, _]) => key);
            log_store.log("Invalid (%o) or missing (%o) skill IDs", invalid_ids, missing_ids);
            error(400, 'Invalid skill ID');
        }

        const answers = skillEntries.map(([key, value]) => ({
            participantId: results[0].survey_access_table.id,
            skillId: parseInt(key),
            rating: parseFloat(value.toString()) * 10 // convert to int to store in the database without rounding issues etc.
        }));
        if (answers.some(answer => isNaN(answer.rating) || answer.rating < 0 || answer.rating > 30)) {
            log_store(
                "Invalid answer: %o",
                answers.filter(answer => isNaN(answer.rating) || answer.rating < 0 || answer.rating > 30)
            );
            error(400, 'Invalid answer');
        }

        await db.insert(surveyAnswersTable).values([...answers]);

        redirect(303, `/${params.accessToken}/thanks`);
    }
}