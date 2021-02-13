FROM node:14-alpine AS base
FROM base as builder

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
COPY tsconfig.json /app
COPY src /app/src

RUN yarn install --frozen-lockfile
RUN yarn build

RUN mv /app/node_modules /app/node_modules_dev
RUN yarn install --frozen-lockfile --production

FROM base
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json

CMD [ "node", "/app/dist/index.js" ]
