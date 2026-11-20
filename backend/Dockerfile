# Stage 1: Build the Spring Boot application using Maven
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (caching layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy application source code
COPY src ./src

# Package the application (skip tests during container build; tested in CI/pre-commit)
RUN ./mvnw package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-privileged system user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy built JAR from builder stage
COPY --from=build /app/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

# Dynamic port binding (Render assigns $PORT at runtime, defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Production Java execution options (cgroup-aware memory limits)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
