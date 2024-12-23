export type Ok<T> = { type: 'OK', value: T };
export type Err<E> = { type: 'ERR', error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
    return { type: 'OK', value };
}

export function isOk<T>(result: Result<T, unknown>): result is Ok<T> {
    return result.type === 'OK';
}

export function err<E>(error: E): Err<E> {
    return { type: 'ERR', error };
}

export function isErr<E>(result: Result<unknown, E>): result is Err<E> {
    return result.type === 'ERR';
}