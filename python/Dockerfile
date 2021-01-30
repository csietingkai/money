# set base image (host OS)
FROM python:3.9.0-alpine

# set the working directory in the container
WORKDIR /app

# copy the dependencies file to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

RUN apk add --update --no-cache g++ gcc libxslt-dev

# install dependencies
RUN pip install -r requirements.txt

# command to run on container start
CMD [ "python", "./PythonApplication.py" ]
