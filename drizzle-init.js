import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    url: process.env.DATABASE_URL
});