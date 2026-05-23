FROM node:20-alpine

RUN apk update && apk add --no-cache \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  nasm \
  bash \
  vips-dev \
  git

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

ENV DATABASE_CLIENT=postgres

RUN NODE_ENV=production npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
