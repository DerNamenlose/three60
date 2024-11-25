import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { surveyAccessTable, surveySkillsTable, surveysTable } from '../../../../db/schema';
import { db } from '../../../../db';
import { generateRandomToken } from '$lib/randomToken';
import { loadSurvey } from '$lib/queries';

export const load: PageServerLoad = async ({ url, locals }) => {
    const baseSurveyId = url.searchParams.get('from');
    if (baseSurveyId) {
        const baseSurvey = await loadSurvey(parseInt(baseSurveyId), locals.userId ?? 0);
        return baseSurvey;
    }
    return null;
}


export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();

        const participants = formData.getAll('participants').filter(email => !!email).map(email => email.toString());
        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const skillTitles = formData.getAll('skill');
        const skillDescriptions = formData.getAll('skill-description');

        if (!title) {
            error(400, 'Title is required');
        }
        if (participants.length === 0) {
            error(400, 'At least one email is required');
        }
        const owner = event.locals.userId;
        if (!owner) {
            error(400, 'User is not logged in');
        }

        const skills = skillTitles.flatMap((title, index) => !!title ? [({
            title: title.toString(),
            description: skillDescriptions[index].toString()
        })] : []);

        if (skills.length === 0) {
            error(400, 'At least one skill is required');
        }

        const ids = await db.insert(surveysTable).values({ title, description, owner }).returning({ id: surveysTable.id });

        const surveyId = ids[0].id;
        for (const participant of participants) {
            await db.insert(surveyAccessTable).values({ surveyId, recepientEmail: participant, accessToken: generateRandomToken() });
        }
        for (const skill of skills) {
            await db.insert(surveySkillsTable).values({ surveyId, title: skill.title, description: skill.description });
        }
        redirect(303, `/survey/${surveyId}`);
    }
} satisfies Actions;