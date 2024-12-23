declare const BRAND: unique symbol;

export type Brand<B> = {
    [BRAND]: B
}

export type Branded<T, B> = T & Brand<B>;