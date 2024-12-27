import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSession, setSessionTokenCookie } from '../../lib/session/session';
import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { generateRandomToken } from '$lib/randomToken';

import debug from 'debug';
import { config } from '$lib/configuration';

let log = debug('login');

export const load: PageServerLoad = () => {
    return {
        enableRegister: config.enableRegister
    }
}

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        if (!email || !password) {
            log('Email and password are required');
            error(400, 'Email and password are required');
        }

        const userCredentials = await db.select().from(usersTable).where(eq(usersTable.email, email));
        if (userCredentials.length === 0) {
            error(403, 'Invalid credentials');
        }
        if (userCredentials[0].verification_code) {
            log('Email %s not yet verified', email);
            error(403, "Your account is not yet verified");
        }
        const isPasswordValid = await verify(userCredentials[0].password_hash, password);
        if (isPasswordValid) {
            // create the session
            const token = generateRandomToken();
            await createSession(token, userCredentials[0].id);
            setSessionTokenCookie(event, token, new Date(Date.now() + 600 * 1000));
            // redirect to the original URI
            const redirect_uri = event.url.searchParams.get('redirect_uri');
            if (redirect_uri) {
                redirect(303, redirect_uri);
            }
            else {
                redirect(303, '.');
            }
        }
        else {
            log('Invalid credentials for %s', email);
            error(403, 'Invalid credentials');
        }
    }
} satisfies Actions;