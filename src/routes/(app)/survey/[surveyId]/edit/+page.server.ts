import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import debug from 'debug';
import { fromFormData } from '$lib/survey';
import { db } from '../../../../../db';
import { surveyAccessTable, surveyAnswersTable, surveySkillsTable, surveysTable } from '../../../../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { addParticipant, addSkill, loadSurveyData } from '../../../../../db/survey';

const log = debug('survey:admin:edit');

export const load: PageServerLoad = async ({ params, locals }) => {
    return await loadSurveyData(params.surveyId, locals.userId);
}

export const actions = {
    default: async ({ request, params, locals }) => {
        const owner = locals.userId;
        if (!owner) {
            error(400, 'User is not logged in');
        }

        const formData = await request.formData();

        const { participants, title, description, skills } = fromFormData(formData);

        if (!title) {
            error(400, 'Title is required');
        }
        if (skills.length === 0) {
            error(400, 'At least one skill is required');
        }

        const survey = await loadSurveyData(params.surveyId, locals.userId);

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
        // delete all participants no longer part of the survey
        await db.delete(surveyAccessTable).where(inArray(surveyAccessTable.recepientEmail, deletedParticipants.map(participant => participant.email)));
        // delete answers from deleted participants
        await db.delete(surveyAnswersTable).where(inArray(surveyAnswersTable.participantId, deletedParticipants.map(participant => participant.id)));
        // add any new participants
        for (const newParticipant of newParticipants) {
            await addParticipant(survey.id, newParticipant);
        }

        redirect(303, ".");
    }
}