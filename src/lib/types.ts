import type { Branded } from "./branded";

export type Email = Branded<string, 'email'>;
export type Password = Branded<string, 'password'>;
export type VerificationCode = Branded<string, 'verificationCode'>;