import { env } from '$env/dynamic/private';

let allowedDomains: string[]

export const config = {

    get enableRegister() {
        return env.ENABLE_REGISTER === 'true';
    },

    get allowableDomains() {
        if (!allowedDomains) {
            allowedDomains = env.ALLOWABLE_DOMAINS?.split(',') ?? [];
        }
        return allowedDomains;
    },

    /// Returns true if the config disabled the verification of emails on registration
    get emailVerificationDisabled() {
        return env.EMAIL_VERIFICATION_DISABLED === 'true';
    },

    /// Get the sender email address
    get senderFrom() {
        return env.SENDER_FROM;
    },

    /// Get the server config
    get emailServer() {
        return emailServerConfig;
    }
}

/// The config for the email server
const emailServerConfig = {
    get host() {
        return env.EMAIL_SERVER_HOST;
    },
    get port() {
        return env.EMAIL_SERVER_PORT ? parseInt(env.EMAIL_SERVER_PORT) : 587;
    },
    get user() {
        return env.EMAIL_SERVER_USER;
    },
    get password() {
        return env.EMAIL_SERVER_PASSWORD;
    }
}