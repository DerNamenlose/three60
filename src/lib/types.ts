import type { Branded } from "./branded";

export type Email = Branded<string, 'email'>;
export type Password = Branded<string, 'password'>;
export type AccessToken = Branded<string, 'accessToken'>;
export type VerificationCode = Branded<string, 'verificationCode'>;
export type SurveyId = Branded<number, 'surveyId'>;
export type UserId = Branded<number, 'userId'>;
export type ParticipantId = Branded<number, 'participantId'>;
export type SkillId = Branded<number, 'skillId'>;


/// Access level to a survey. Higher levels include lower levels
export enum AccessLevel {
    /// Users may clone the survey
    Clone = 10,
    /// Users may read the results of a survey
    ReadResult = 20,
    /// Users may edit the survey
    Edit = 30,
    /// Users own this survey and may do whatever they like
    Owner = 255,
}

/// shared user datatype
export type User = {
    id: UserId;
    email: Email;
}

/// marker value for "any user" used in the form input fields
export const AnyoneMarker = '--(Anyone)--';

/// meta data for a specific survey
export type SurveyMetaData = {
    id: SurveyId;
    title: string;
    description: string | null;
    fillRate?: {
        filled: number;
        expected: number;
    };
    /// the permission of the specific user in whose context the survey is loaded. This will not include other user's permissions
    permissions: AccessLevel;
}

export type SurveyAnswer = {
    skillId: SkillId;
    rating: number;
}

/// Information about a specific participant in a survey
export type SurveyParticipant = {
    id: ParticipantId;
    email: Email;
    accessToken: AccessToken | null;
    answers: SurveyAnswer[];
}

/// Information about a specific skill
export type SurveySkill = {
    id: SkillId;
    title: string;
    description: string | undefined | null;
}

/// Complete data for a survey including skills & participants
export type SurveyData = SurveyMetaData & {
    participants: SurveyParticipant[];
    skills: SurveySkill[];
}