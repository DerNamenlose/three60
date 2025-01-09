import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { loadMySurveys, loadSurveyFillRates } from '../../db/survey';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.userId) {
        error(403, 'User is not logged in');
    }
    const mySurveys = await loadMySurveys(locals.userId);
    const surveyWithFillRates = await loadSurveyFillRates(mySurveys);

    return {
        surveys: surveyWithFillRates
    }
}