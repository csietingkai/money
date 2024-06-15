FROM maven:3.9.1-eclipse-temurin-17-alpine AS dependency
WORKDIR /app
COPY pom.xml .
RUN mvn -B -e -C org.apache.maven.plugins:maven-dependency-plugin:3.3.0:go-offline

FROM maven:3.9.1-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY --from=dependency /root/.m2 /root/.m2
COPY src/main/resources /app/src/main/resources
COPY src/main/java /app/src/main/java
COPY pom.xml /app
RUN mvn -B -e clean package

FROM openjdk:17-jdk-slim
COPY --from=build /app/target/money.jar /api.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dspring.profiles.active=container","/api.jar"]
