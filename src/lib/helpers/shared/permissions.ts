
import type { AccessLevel, SurveyMetaData } from "$lib/types";

/**
 * Check whether a given survey has at least the required access level.
 * 
 * @param survey The survey to check
 * @param accessLevel The minimum access level required 
 */
export function checkAccess(survey: SurveyMetaData, accessLevel: AccessLevel) {
    return survey.permissions >= accessLevel; // Note: this simple check doesn't strictly need a function, but this makes it easier to read wherever we employ that condition
}

/// Execute the given action only if the user has the required access to the given survey
export function whenAccess<T>(survey: SurveyMetaData, accessLevel: AccessLevel, action: () => T): T | null {
    if (checkAccess(survey, accessLevel)) {
        return action();
    }
    return null;
}