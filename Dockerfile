FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run lint && npm run build

FROM eclipse-temurin:21-jdk-jammy AS backend
WORKDIR /app/backend
COPY backend/ ./
RUN chmod +x mvnw
COPY --from=frontend /app/frontend/dist/ src/main/resources/static/
RUN ./mvnw -B package

FROM eclipse-temurin:21-jre-jammy
RUN groupadd --system app && useradd --system --gid app app
WORKDIR /app
COPY --from=backend /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh
USER app
EXPOSE 8080
ENTRYPOINT ["/app/start.sh"]
