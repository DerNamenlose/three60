import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url, ...rest }) => {
    if (!locals.userId) {
        redirect(307, `/login?redirect_uri=${url.href}`);
    }
};