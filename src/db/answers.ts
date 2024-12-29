import { eq } from "drizzle-orm";
import { db } from ".";
import { surveyAnswersTable } from "./schema";

export async function deleteAnswers(participandId: number) {
    await db.delete(surveyAnswersTable).where(eq(surveyAnswersTable.participantId, participandId));
}