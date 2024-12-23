
/// lazily instantiate an instance of T and store it for further use
export function lazy<T>(fn: () => T): () => T {
    let value: T;

    return () => {
        if (!value) {
            value = fn();
        }
        return value;
    };
}