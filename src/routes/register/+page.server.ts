import { hash } from '@node-rs/argon2';
import type { Actions } from './$types';
import { usersTable } from '../../db/schema';
import { db } from '../../db';
import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        const hashedPassword = await hash(password);

        await db.insert(usersTable).values({
            email,
            password_hash: hashedPassword
        });

        redirect(303, '/login');
    }
} satisfies Actions;