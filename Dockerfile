FROM docker.io/node:23 as builder

WORKDIR /build

COPY ./src ./src
COPY ./static ./static
COPY .npmrc package.json package-lock.json postcss.config.js svelte.config.js tailwind.config.ts tsconfig.json vite.config.ts ./
RUN npm ci
RUN npm run build

FROM docker.io/node:23

WORKDIR /app
COPY --from=builder /build/build ./
COPY --from=builder /build/package.json /build/package-lock.json ./
COPY ./entrypoint.sh ./drizzle-init.js ./
COPY ./drizzle ./
RUN npm ci --production

EXPOSE 3000
# ENTRYPOINT ["./entrypoint.sh"]
ENTRYPOINT ["node", "index.js"]
