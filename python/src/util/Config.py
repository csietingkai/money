import os

DATASOURCE = {
    'host': os.getenv('DATASOURCE_HOST'),
    'port': int(os.getenv('DATASOURCE_PORT')),
    'db': os.getenv('DATASOURCE_DB'),
    'username': os.getenv('DATASOURCE_USERNAME'),
    'password': os.getenv('DATASOURCE_PASSWORD')
}
