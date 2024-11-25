import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const db = drizzle({
    connection: 'file:db.sqlite',
    schema
});