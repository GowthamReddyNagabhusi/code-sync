# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (layer-cache friendly)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Use JDK (not JRE) so the container can compile & run Java user code.
# Also install Python 3 and GCC for Python/C++ execution.
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Install language runtimes for sandboxed execution:
#   python3       — runs Python user code directly
#   g++ / gcc     — compiles and runs C++ user code
#   musl-dev      — required by g++ on Alpine
RUN apk add --no-cache \
    python3 \
    g++ \
    gcc \
    musl-dev

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Give /tmp write access so execution strategies can create temp dirs
RUN chmod 1777 /tmp

COPY --from=builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
