import { error } from "@sveltejs/kit";
import debug from "debug";

const log = debug('types');

export function parse<T extends number>(value: string): T {
    const parsed = parseInt(value);
    if (isNaN(parsed)) {
        log('Invalid ID %s', value);
        error(400, 'Invalid  ID');
    }
    return parsed as T;
}