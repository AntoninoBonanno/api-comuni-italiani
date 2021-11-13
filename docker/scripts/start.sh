#!/bin/bash

# DATABASE_URL = mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}
first_split=(${DATABASE_URL//@/ })
second_split=(${first_split[1]//\// })

HOST_URI=${second_split[0]}

# Wait until database is available, and migrate schemas
./scripts/wait-for-it.sh -s $HOST_URI -- npx prisma migrate deploy && npx prisma generate

pm2-runtime app.js