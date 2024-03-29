## 1. Create temp docker image to build the app
FROM node:15-alpine AS builder
WORKDIR /usr/app
COPY .. .

RUN npm install
RUN npm run build

## 2. Copy the builded app from temp docker image into final docker image
FROM node:15-alpine
WORKDIR /usr/app

ENV APP_PORT=8000
# Optimise for production
ENV NODE_ENV=production

# Copy app files
COPY --from=builder /usr/app/package.json .
COPY --from=builder /usr/app/dist .
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/app/docker/scripts ./scripts

RUN chmod -R +x ./scripts/
RUN apk add --no-cache --upgrade bash # Add bash to run scripts

RUN npm install --only=production # Install only production dependencies
RUN npm install pm2 -g # Process manager

EXPOSE ${APP_PORT}
CMD ["bash", "./scripts/start.sh"]
