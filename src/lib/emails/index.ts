import * as nodemailer from "nodemailer";

import type { Email } from "$lib/types";
import { config } from "$lib/configuration";
import { lazy } from "$lib/lazy";

const emailTransport = lazy(() => {


    if (!config.emailServer.host) {
        throw new Error("Tried to send email without a configured email server");
    }

    return nodemailer.createTransport({
        host: config.emailServer.host,
        port: config.emailServer.port ?? 587,
        auth: {
            user: config.emailServer.user,
            pass: config.emailServer.password
        }
    })
});

export function sendEmail(recepientEmail: Email, title: string, bodyText: string) {
    try {
        emailTransport().sendMail({
            from: config.senderFrom,
            to: recepientEmail,
            subject: title,
            text: bodyText
        });
    }
    catch (e) {
        console.error("Failed to send email", e);
    }
}