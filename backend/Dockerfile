# Start with a base image containing Java runtime
FROM openjdk:11-jdk-slim

# Add Maintainer Info
LABEL maintainer="tingkai@csie.io"

# Add a volume pointing to /tmp
VOLUME /tmp

# Make port 8080 available to the world outside this container
EXPOSE 8080

# The application's jar file
ARG JAR_FILE=target/money.jar

# Add the application's jar to the container
ADD ${JAR_FILE} api.jar

# Run the jar file 
ENTRYPOINT ["java","-jar","-Dspring.profiles.active=container","/api.jar"]
