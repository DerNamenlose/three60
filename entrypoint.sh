#! /bin/bash

if [ "x$INIT_DB" = "xtrue" ]; then
    echo "Initializing database...";
    npm install drizzle-kit
    sleep 10;
    npx drizzle-kit migrate --config=drizzle-init.js
fi

echo "Starting server..."
exec node index.js