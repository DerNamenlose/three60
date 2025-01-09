import type { Handle } from "@sveltejs/kit";

import { deleteSessionTokenCookie, setSessionTokenCookie, validateSession } from "./lib/session/session";

import debug from 'debug';
import type { UserId } from "$lib/types";

const log = debug('hooks');

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get("session") ?? null;
    if (token === null) {
        log("No session available")
        event.locals.userId = null;
        event.locals.session = null;
        return resolve(event);
    }

    const session = await validateSession(token);
    if (session !== null) {
        setSessionTokenCookie(event, token, new Date(session.expires));
    } else {
        deleteSessionTokenCookie(event);
    }

    event.locals.session = session;
    event.locals.userId = session?.userId as UserId ?? null;
    return resolve(event);
};
