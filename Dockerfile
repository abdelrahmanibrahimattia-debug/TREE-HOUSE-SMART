FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/
RUN cd backend && npx prisma generate

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "src/server.js"]
