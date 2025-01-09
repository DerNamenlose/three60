import { parse } from "$lib/helpers/backend/parse";
import { ensureAccess } from "$lib/helpers/backend/permissions";
import { AccessLevel, AnyoneMarker, type SurveyId, type UserId } from "$lib/types";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { loadSurveyMetadata, loadSurveyPermissions, setPermissions, type PermissionEntry } from "../../../../../db/survey";

export const load: PageServerLoad = async ({ params, locals }) => {
    const surveyId = parse<SurveyId>(params.surveyId);
    let userId = await ensureAccess(surveyId, locals.userId, AccessLevel.Owner, "Only the survey owner can give access to the survey");

    const survey = await loadSurveyMetadata(surveyId, userId);
    const permissions = await loadSurveyPermissions(surveyId);
    return { survey, permissions: permissions.map(p => ({ user: p.user, access: p.access })) };
}

export const actions = {
    default: async ({ request, params, locals }) => {
        const surveyId = parse<SurveyId>(params.surveyId);
        await ensureAccess(surveyId, locals.userId, AccessLevel.Owner, 'The current user cannot edit the permissions of this survey');

        const formData = await request.formData();

        const permissions = formData.getAll("permissions");
        const userPermissions: PermissionEntry[] = formData.getAll("userIds").map((userId, index) => ({
            user: userId === AnyoneMarker ? null : parse<UserId>(userId.toString()),
            access: parse<AccessLevel>(permissions[index].toString())
        }));

        // some basic validation to prevent users from creating surveys without owners
        if (!userPermissions.some(p => p.access === AccessLevel.Owner)) {
            console.log("No owner", userPermissions);
            error(400, "A survey must have at least one owner");
        }

        await setPermissions(surveyId, userPermissions);

        redirect(303, `.`);
    }
}