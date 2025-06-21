FROM oven/bun:1.2-alpine as base

WORKDIR /app

COPY package.json bun.lock ./

FROM base as development

RUN bun install

COPY . .

RUN addgroup -g 1001 -S nodejs || true
RUN adduser -S bun -u 1001 || true

RUN chown -R bun:bun /app
USER bun

EXPOSE 3000

CMD ["bun", "run", "dev"]

FROM base as production

RUN bun install --production --frozen-lockfile

COPY . .

RUN bun run build

RUN addgroup -g 1001 -S nodejs || true
RUN adduser -S bun -u 1001 || true

RUN chown -R bun:bun /app
USER bun

EXPOSE 3000

CMD ["bun", "run", "start"] 