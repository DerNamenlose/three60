import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import debug from 'debug';
import { fromFormData } from '$lib/survey';
import { db } from '../../../../../db';
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from '../../../../../db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { addParticipant, addSkill, loadSurveyData } from '../../../../../db/survey';
import { ensureAccess } from '$lib/helpers/backend/permissions';
import { parse } from '$lib/helpers/backend/parse';
import { AccessLevel, type SurveyId } from '$lib/types';

const log = debug('survey:admin:edit');

export const load: PageServerLoad = async ({ params, locals }) => {
    await ensureAccess(parse<SurveyId>(params.surveyId), locals.userId, AccessLevel.Edit, 'The current user cannot edit this survey');
    return await loadSurveyData(parse<SurveyId>(params.surveyId), locals.userId);
}

export const actions = {
    default: async ({ request, params, locals }) => {
        await ensureAccess(parse<SurveyId>(params.surveyId), locals.userId, AccessLevel.Edit, 'The current user cannot edit this survey');

        const formData = await request.formData();

        const { participants, title, description, skills } = fromFormData(formData);

        if (!title) {
            error(400, 'Title is required');
        }
        if (skills.length === 0) {
            error(400, 'At least one skill is required');
        }

        // TODO this should probably be handled in a single transaction
        const survey = await loadSurveyData(parse<SurveyId>(params.surveyId), locals.userId);

        // update the actual survey object
        await db.update(surveysTable).set({ title, description }).where(eq(surveysTable.id, survey.id));

        // update the skills where applicable
        for (let idx = 0; idx < Math.max(survey.skills.length, skills.length); idx++) {
            const newSkill = skills[idx];
            const oldSkill = survey.skills[idx];
            if (newSkill && oldSkill) {
                // this is an update -> change the text only
                await db.update(surveySkillsTable).set({ title: newSkill.title, description: newSkill.description }).where(eq(surveySkillsTable.id, oldSkill.id));
            } else if (newSkill && !oldSkill) {
                // this is a new skill -> insert it into the table
                await addSkill(survey.id, newSkill.title, newSkill.description);
            } else if (!newSkill && oldSkill) {
                // this is a deleted skill -> delete it from the table
                await db.delete(surveySkillsTable).where(eq(surveySkillsTable.id, oldSkill.id));
                // if a skill is deleted, also delete any potential answers for that skill
                await db.delete(surveyAnswersTable).where(eq(surveyAnswersTable.skillId, oldSkill.id));
            }
        }

        // update the participants where applicable (unchanged participants are left untouched)
        const deletedParticipants = survey.participants.filter(participant => !participants.includes(participant.email));
        const newParticipants = participants.filter(email => !survey.participants.some(candidate => candidate.email === email));
        // delete all participants no longer part of the survey (this should also delete their answers via cascade delete)
        await db.delete(surveyAccessTable).where(
            and(
                eq(surveyAccessTable.surveyId, survey.id),
                inArray(surveyAccessTable.recepientEmail, deletedParticipants.map(participant => participant.email))
            )
        );
        // add any new participants
        for (const newParticipant of newParticipants) {
            await addParticipant(survey.id, newParticipant);
        }

        redirect(303, ".");
    }
}