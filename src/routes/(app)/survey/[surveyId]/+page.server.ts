import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { loadSurvey } from '$lib/queries';

import debug from 'debug';
import { deleteAnswers } from '../../../../db/answers';

const log = debug('survey:admin');

async function loadSurveyData(params: RouteParams, locals: App.Locals) {
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

export const load: PageServerLoad = async ({ params, locals }) => {
    return await loadSurveyData(params, locals);
}

export const actions = {
    deleteAnswers: async ({ params, locals, request }) => {
        const survey = await loadSurveyData(params, locals);

        let formData = await request.formData();
        const participantId = parseInt(formData.get('participantId')?.toString() ?? '');

        if (isNaN(participantId)) {
            log('Invalid participant ID when trying to delete answers: %s', formData.get('participandId')?.toString());
            error(400, 'Invalid participant ID');
        }

        await deleteAnswers(participantId);

        redirect(303, survey.id.toString());
    }
}