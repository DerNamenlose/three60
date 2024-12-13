import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

export const db = drizzle(
    env.DATABASE_URL ?? '',
    {
        schema,
        mode: 'default'
    });