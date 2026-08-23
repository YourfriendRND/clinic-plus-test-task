# Контекст сборки - корень монорепо (compose: dockerfile: apps/api/Dockerfile).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w api

FROM deps AS build
COPY apps/api apps/api
RUN npm run build -w api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=4000
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w api --omit=dev && npm cache clean --force
COPY --from=build /app/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/index.js"]
