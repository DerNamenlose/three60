import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { sendVerificationEmail } from '$lib/emails/verification';
import { createNewUser } from '../../db/users';
import type { Email, Password } from '$lib/types';
import { config } from '$lib/configuration';

export const load: PageServerLoad = () => {
    return {
        allowableDomains: config.allowableDomains
    }
}

function getBaseUrl(requestUrl: URL) {
    return `${requestUrl.protocol}//${requestUrl.host}`
}

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email')?.toString() as Email | undefined;
        const password = formData.get('password')?.toString() as Password | undefined;

        if (!email || !password) {
            error(400, 'Email and password are required');
        }

        if (config.allowableDomains && !config.allowableDomains?.some(domain => email.endsWith(domain))) {
            error(400, 'Invalid email domain');
        }

        const result = await createNewUser(email, password);

        if (result.verificationCode) {
            sendVerificationEmail(email, result.verificationCode, getBaseUrl(event.url));
        }

        redirect(303, '/register/success');
    }
} satisfies Actions;