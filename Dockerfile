## 1. Create temp docker image to build the app
FROM node:15-alpine AS builder
WORKDIR /usr/app
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./prisma/schema.prisma ./prisma/schema.prisma
COPY ./src ./src

RUN npm install
RUN npm run build

## 2. Copy the builded app from temp docker image into final docker image
FROM node:15-alpine
WORKDIR /usr/app

COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/dist .
COPY --from=builder /usr/app/prisma ./prisma

RUN npm install --only=production # Install only production dependencies
RUN npm install pm2 -g # Process manager
RUN npx prisma generate

EXPOSE 8000
CMD ["pm2-runtime","app.js"]
