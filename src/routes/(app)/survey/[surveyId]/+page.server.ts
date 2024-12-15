import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadSurvey } from '$lib/queries';

import debug from 'debug';

const log = debug('survey:admin');

export const load: PageServerLoad = async ({ params, locals }) => {
    const surveyId = parseInt(params.surveyId);

    if (isNaN(surveyId)) {
        log('Invalid survey ID %s', params.surveyId);
        error(400, 'Invalid survey ID');
    }
    if (!locals.userId) {
        log('User is not logged in');
        error(403, 'User is not logged in');
    }

    const surveyData = await loadSurvey(surveyId, locals.userId);
    if (!surveyData) {
        log('Survey not found or user (%s) does not have access: %s', locals.userId, params.surveyId);
        error(404, 'Survey not found');
    }
    return surveyData;
}