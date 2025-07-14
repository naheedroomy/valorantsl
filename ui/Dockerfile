# Stage 1: Build the React app
FROM node:20-alpine as builder
WORKDIR /app
COPY ui/package*.json ./
RUN npm install
COPY ui/ .
RUN npm run build

# Stage 2: Serve the app with a static server
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
