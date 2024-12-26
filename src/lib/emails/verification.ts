import type { Email, VerificationCode } from "$lib/types";
import { sendEmail } from ".";

export function sendVerificationEmail(email: Email, verificationCode: VerificationCode, baseUrl: string) {
    sendEmail(email, 'Welcome to Three60 surveys', `Hello,
        
please confirm your account email address by clicking the link below:

        ${baseUrl}/verify/${verificationCode}

Thank you.

P.S.: If you didn't request this email, please ignore it. The registration will expire in a few days and all related data will be deleted.
`);
}