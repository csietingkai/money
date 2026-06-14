FROM maven:3.9.16-eclipse-temurin-25-alpine AS dependency
WORKDIR /app
COPY pom.xml .
RUN mvn -B -e -C org.apache.maven.plugins:maven-dependency-plugin:3.11.0:go-offline

FROM maven:3.9.16-eclipse-temurin-25-alpine AS build
WORKDIR /app
COPY --from=dependency /root/.m2 /root/.m2
COPY src/main/resources /app/src/main/resources
COPY src/main/java /app/src/main/java
COPY pom.xml /app
RUN mvn -B -e clean package

FROM eclipse-temurin:25.0.3_9-jre-alpine-3.23
COPY --from=build /app/target/money.jar /api.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dspring.profiles.active=container","/api.jar"]
