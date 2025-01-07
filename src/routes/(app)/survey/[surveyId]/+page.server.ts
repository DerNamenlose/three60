import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';

import debug from 'debug';
import { deleteAnswers } from '../../../../db/answers';
import { loadSurveyData } from '../../../../db/survey';

const log = debug('survey:admin');

export const load: PageServerLoad = async ({ params, locals }) => {
    return await loadSurveyData(params.surveyId, locals.userId);
}

export const actions = {
    deleteAnswers: async ({ params, locals, request }) => {
        const survey = await loadSurveyData(params.surveyId, locals.userId);

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