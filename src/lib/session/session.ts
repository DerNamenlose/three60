import { db } from '../../db';
import { sessions } from '../../db/schema';
import { eq, lt } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import type { UserId } from '$lib/types';

export type Session = {
    userId: number;
    expires: number; // Millisecond UNIX timestamp
}

const sessionSeconds = 1800;

function getExpiryTime() {
    return Date.now() + sessionSeconds * 1000;
}

export async function createSession(token: string, userId: number) {
    const session = {
        userId,
        expires: getExpiryTime()
    }
    await db.insert(sessions).values({ token, userId, expires: session.expires });
    return session;

}

export async function validateSession(token: string) {
    const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (session[0] && session[0].expires > Date.now()) {
        const newExpires = getExpiryTime();
        db.update(sessions).set({ expires: newExpires }).where(eq(sessions.token, token)); // refresh the session as long as the user is working in it
        return {
            ...session[0],
            userId: session[0].userId as UserId,
            expires: newExpires
        };
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
        path: "/" // TODO this should be limited to the path the application is running on
    });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
    event.cookies.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
        path: "/" // TODO this should be limited to the path the application is running on
    });
}
