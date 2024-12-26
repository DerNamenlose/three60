import { config } from "$lib/configuration"
import type { PageServerLoad } from "../$types"

export const load: PageServerLoad = () => {
    return {
        showEmailNotice: !config.emailVerificationDisabled
    }
}