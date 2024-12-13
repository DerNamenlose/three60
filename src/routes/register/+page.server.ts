import { hash } from '@node-rs/argon2';
import type { Actions, PageServerLoad } from './$types';
import { usersTable } from '../../db/schema';
import { db } from '../../db';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = () => {
    return {
        allowableDomains: env.ALLOWABLE_DOMAINS
    }
}

export const actions = {
    default: async (event) => {
        const allowedDomains = env.ALLOWABLE_DOMAINS?.split(',');
        const formData = await event.request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        if (!email || !password) {
            error(400, 'Email and password are required');
        }

        if (allowedDomains && !allowedDomains?.some(domain => email.endsWith(domain))) {
            error(400, 'Invalid email domain');
        }

        const hashedPassword = await hash(password);

        await db.insert(usersTable).values({
            email,
            password_hash: hashedPassword
        });

        redirect(303, '/login');
    }
} satisfies Actions;