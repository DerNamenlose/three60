import type { Handle } from "@sveltejs/kit";

import { deleteSessionTokenCookie, setSessionTokenCookie, validateSession } from "./lib/session/session";

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get("session") ?? null;
    if (token === null) {
        console.log("No session available")
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
    event.locals.userId = session?.userId ?? null;
    return resolve(event);
};
