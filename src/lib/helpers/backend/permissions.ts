import type { AccessLevel, SurveyId, UserId } from "$lib/types";
import { error } from "@sveltejs/kit";
import { hasAccess } from "../../../db/survey";

/**
 * Check whether the given user has the required access level to the given survey. This will immediately return the appropriate HTTP error if the user doesn't have access
 * 
 * @param surveyId The ID of the survey to check
 * @param userId The ID of the user to check the access for
 * @param accessLevel The required access level the user would need
 */
export async function ensureAccess(surveyId: SurveyId, userId: UserId | undefined | null, accessLevel: AccessLevel, errorMsg?: string): Promise<UserId> {
    if (!userId) {
        error(401, 'User is not logged in');
    }
    const userHasAccess = await hasAccess(surveyId, userId, accessLevel);
    if (!userHasAccess) {
        error(403, errorMsg ?? 'User does not have the required permission');
    }
    return userId
}