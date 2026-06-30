FROM node:20-alpine AS base
WORKDIR /app

FROM base AS build
COPY shared/package*.json shared/
RUN npm install --prefix shared
COPY shared shared
RUN npm run build --prefix shared

COPY backend/package*.json backend/
RUN npm install --prefix backend
COPY backend backend
COPY tsconfig.base.json tsconfig.base.json
RUN npm run build --prefix backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/node_modules ./backend/node_modules
EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
