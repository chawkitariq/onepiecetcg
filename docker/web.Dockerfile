FROM node:22-alpine

WORKDIR /app

ENV CI=true

RUN corepack enable
RUN corepack prepare pnpm@11.13.1 --activate

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --dir packages/shared build
RUN pnpm --dir apps/web build

EXPOSE 3001

CMD ["node", "apps/web/.output/server/index.mjs"]
