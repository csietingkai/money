FROM python:3.9.0-alpine
RUN apk add --update --no-cache g++ gcc libxslt-dev
COPY requirements.txt /requirements.txt
RUN pip install -r requirements.txt
COPY src /app
WORKDIR /app
ENV PATH=/home/app/.local/bin:$PATH
EXPOSE 5000
CMD [ "python", "./PythonApplication.py" ]
