# ---------- Build frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build   # produces /frontend/dist

# ---------- Build backend ----------
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Copy the built frontend static files into Spring Boot's static resources directory before package
COPY --from=frontend-build /frontend/dist ./src/main/resources/static
RUN mvn -B -DskipTests clean package

# ---------- Runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/jobtracker-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
