## 1. Create temp docker image to build the app
FROM node:15-alpine AS builder
WORKDIR /usr/app
COPY .. .

RUN npm install
RUN npm run build

## 2. Copy the builded app from temp docker image into final docker image
FROM node:15-alpine
WORKDIR /usr/app

COPY --from=builder /usr/app/package.json .
COPY --from=builder /usr/app/dist .
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/app/docker/scripts ./scripts

RUN chmod -R +x ./scripts/
RUN apk add --no-cache --upgrade bash # Add bash to run scripts

RUN npm install --only=production # Install only production dependencies
RUN npm install pm2 -g # Process manager

EXPOSE 8000
CMD ["bash", "./scripts/start.sh"]
