import { isErr, isOk } from "$lib/result";
import type { VerificationCode } from "$lib/types";
import debug from "debug";
import { verifyUser } from "../../../db/users";
import type { PageServerLoad } from "./$types"
import { error } from "@sveltejs/kit";

let log = debug('verify');

export const load: PageServerLoad = async ({ params }) => {
    const verificationCode = params.verificationCode;

    const userResult = await verifyUser(verificationCode as VerificationCode);

    if (isErr(userResult)) {
        log('Failed to verify user with code %s: %s', verificationCode, userResult.error);
        error(403, `Cannot verify user: ${userResult.error}`);
    }

    return {
        email: userResult.value.email
    };
}