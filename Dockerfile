FROM oven/bun
WORKDIR /usr/src/app

COPY . .
RUN bun install --production
RUN bun build.ts

EXPOSE 8000/tcp
ENTRYPOINT [ "bun", "server.ts" ]