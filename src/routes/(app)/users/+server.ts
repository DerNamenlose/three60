import { json, type RequestHandler } from "@sveltejs/kit";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { like } from "drizzle-orm";

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.userId) {
        return new Response(null, { status: 403 });
    }

    const searchTerm = url.searchParams.get('query');
    if ((searchTerm?.length ?? 0) < 3) {
        return new Response(JSON.stringify({ error: 'Query must be at least 3 characters long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const users = await db.select({ id: usersTable.id, email: usersTable.email }).from(usersTable).where(like(usersTable.email, `%${searchTerm}%`));

    return json(users);
};