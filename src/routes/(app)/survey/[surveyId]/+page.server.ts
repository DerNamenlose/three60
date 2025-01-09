import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';

import debug from 'debug';
import { deleteAnswers } from '../../../../db/answers';
import { loadSurveyData } from '../../../../db/survey';
import { AccessLevel, type SurveyId } from '$lib/types';
import { ensureAccess } from '$lib/helpers/backend/permissions';
import { parse } from '$lib/helpers/backend/parse';

const log = debug('survey:admin');

export const load: PageServerLoad = async ({ params, locals }) => {
    await ensureAccess(parse<SurveyId>(params.surveyId), locals.userId, AccessLevel.Clone, 'The current user cannot view this survey');
    return await loadSurveyData(parse<SurveyId>(params.surveyId), locals.userId);
}

export const actions = {
    deleteAnswers: async ({ params, locals, request }) => {
        await ensureAccess(parse<SurveyId>(params.surveyId), locals.userId, AccessLevel.Edit, 'The current user cannot edit this survey');

        const survey = await loadSurveyData(parse<SurveyId>(params.surveyId), locals.userId);

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