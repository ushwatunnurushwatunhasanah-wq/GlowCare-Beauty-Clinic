# Dockerfile for React + Vite Frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production server using lightweight Node / Vite preview
EXPOSE 3000

CMD ["npm", "run", "dev"]
