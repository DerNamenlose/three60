import type { Email, Password } from "$lib/types";
import { error, redirect, type Actions } from "@sveltejs/kit";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { loadUser, verifyPassword } from "../../../db/users";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const old_password = formData.get('old_password')?.toString() as Password | undefined;
        const password = formData.get('password')?.toString() as Password | undefined;

        if (!password || !old_password) {
            error(400, 'Old and new password is required');
        }

        if (event.locals.userId === null) {
            error(403, 'User is not logged in');
        }
        // load and verify the old credentials and update the password hash
        const user = await loadUser(event.locals.userId);
        if (!user) {
            error(403, 'User does not exist');
        }
        if (await verifyPassword(old_password, user.password_hash)) {
            await db.update(usersTable).set({ password_hash: await hash(password) }).where(eq(usersTable.id, event.locals.userId));
        }

        redirect(303, '/?pwd_updated=true');
    }
} satisfies Actions;