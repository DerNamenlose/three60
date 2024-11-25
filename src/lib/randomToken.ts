import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function generateRandomToken() {
    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    return encodeBase32LowerCaseNoPadding(randomBytes)
}