FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend ./backend

WORKDIR /app/backend

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
