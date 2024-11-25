import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadSurvey } from '$lib/queries';

export const load: PageServerLoad = async ({ params, locals }) => {
    const surveyId = parseInt(params.surveyId);

    if (isNaN(surveyId)) {
        error(400, 'Invalid survey ID');
    }
    if (!locals.userId) {
        error(403, 'User is not logged in');
    }

    const surveyData = await loadSurvey(surveyId, locals.userId);
    if (!surveyData) {
        error(404, 'Survey not found');
    }
    return surveyData;
}