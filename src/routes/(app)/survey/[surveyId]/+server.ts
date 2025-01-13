import { type RequestHandler } from "@sveltejs/kit";
import { db } from "../../../../db";
import { surveysTable } from "../../../../db/schema";
import { eq } from "drizzle-orm";


export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.userId) {
        return new Response(null, { status: 403 });
    }

    const surveyId = parseInt(params.surveyId ?? '');

    if (isNaN(surveyId)) {
        return new Response(null, { status: 400 });
    }

    await db.delete(surveysTable).where(eq(surveysTable.id, surveyId));

    return new Response(null, { status: 204 });
};