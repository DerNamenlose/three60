import { config } from "$lib/configuration";
import type { Email, Password, User, UserId, VerificationCode } from "$lib/types";
import { hash, verify } from "@node-rs/argon2";
import { db } from ".";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";
import { err, ok, type Result } from "$lib/result";
import debug from "debug";
import { generateRandomToken } from "$lib/helpers/shared/randomToken";

const log = debug('db:users');

export async function createNewUser(email: Email, password: Password): Promise<{ verificationCode: VerificationCode | undefined }> {
    const hashedPassword = await hash(password);

    if (config.emailVerificationDisabled) {
        log("WARNING: Email verification is disabled. Accounts will be enabled immediately. You should not run this in production.");
    }

    const verificationCode = config.emailVerificationDisabled ? undefined : generateRandomToken() as VerificationCode;

    await db.insert(usersTable).values({
        email,
        password_hash: hashedPassword,
        verification_code: verificationCode,
        verifcationCodeExpires: verificationCode ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : undefined
    });

    return {
        verificationCode
    }
}

export async function loadUser(id: number) {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (user.length === 0) {
        return null;
    }
    return {
        id: user[0].id,
        email: user[0].email as Email,
        password_hash: user[0].password_hash
    }
}

export async function verifyPassword(password: Password, password_hash: string) {
    return await verify(password_hash, password);
}

export enum VerificationError {
    InvalidVerificationCode = 'Invalid verification code',
    VerificationCodeExpired = 'Verification code expired'
}

export async function verifyUser(verificationCode: VerificationCode): Promise<Result<User, VerificationError>> {
    let user = await db.select().from(usersTable).where(eq(usersTable.verification_code, verificationCode)).limit(1);

    if (user.length === 0) {
        return err(VerificationError.InvalidVerificationCode);
    }

    if (user[0].verifcationCodeExpires && user[0].verifcationCodeExpires < new Date()) {
        return err(VerificationError.VerificationCodeExpired);
    }

    await db.update(usersTable).set({ verification_code: null, verifcationCodeExpires: null }).where(eq(usersTable.verification_code, verificationCode));

    return ok({
        id: user[0].id as UserId,
        email: user[0].email as Email
    });
}