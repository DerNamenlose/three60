import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { surveysTable } from '../../../../db/schema';
import { db } from '../../../../db';
import { fromFormData } from '$lib/survey';
import { addParticipant, addSkill, loadSurvey } from '../../../../db/survey';

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
        const owner = event.locals.userId;
        if (!owner) {
            error(400, 'User is not logged in');
        }

        const formData = await event.request.formData();

        const { participants, title, description, skills } = fromFormData(formData);

        if (!title) {
            error(400, 'Title is required');
        }


        if (skills.length === 0) {
            error(400, 'At least one skill is required');
        }

        const ids = await db.insert(surveysTable).values({ title, description, owner }).$returningId();

        const surveyId = ids[0].id;
        for (const participant of participants) {
            await addParticipant(surveyId, participant);
        }
        for (const skill of skills) {
            await addSkill(surveyId, skill.title, skill.description);
        }
        redirect(303, `/survey/${surveyId}`);
    }
} satisfies Actions;