import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { db } from '../../db';
import { sessions } from '../../db/schema';
import { eq, lt } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

export type Session = {
    userId: number;
    expires: number; // Millisecond UNIX timestamp
}

export async function createSession(token: string, userId: number) {
    const session = {
        userId,
        expires: Date.now() + 600 * 1000 // 600 seconds
    }
    await db.insert(sessions).values({ token, userId, expires: session.expires });
    return session;

}

export async function validateSession(token: string) {
    const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (session[0] && session[0].expires > Date.now()) {
        db.update(sessions).set({ expires: Date.now() + 600 * 1000 }).where(eq(sessions.token, token)); // refresh the session as long as the user is working in it
        return session[0];
    }
    await db.delete(sessions).where(lt(sessions.expires, Date.now())); // clean up
    return null;
}

export async function invalidateSession(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
    event.cookies.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        expires: expiresAt,
        path: "/"
    });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
    event.cookies.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
        path: "/"
    });
}
