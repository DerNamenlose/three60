import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: process.env.MARIADB_ROOT_PASSWORD,
        database: "three60",
    },
});