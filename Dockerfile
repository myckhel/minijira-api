FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn prisma:generate

EXPOSE 3000

CMD ["yarn", "start:dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production && yarn cache clean

COPY . .

RUN yarn build
RUN yarn prisma:generate

EXPOSE 3000

CMD ["yarn", "start:prod"]
