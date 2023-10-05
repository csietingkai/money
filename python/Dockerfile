FROM python:3.8.10-slim as base

# Setup env
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONFAULTHANDLER 1


FROM base AS python-deps

# Install pipenv and compilation dependencies
RUN pip install pipenv
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++

# Install python dependencies in /.venv
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install flask==2.0.1 numpy==1.21.1 flask-restful==0.3.9 flask-sqlalchemy==2.5.1 pandas==1.3.1 psycopg2-binary==2.9.1 requests==2.26.0 sqlalchemy==1.4.22 twder==0.2.2 quandl==3.6.1 matplotlib==3.4.2 pytrends==4.7.3 plotly==5.1.0 pystan==2.19.1.1 convertdate==2.1.2 lunarcalendar==0.0.9 holidays==0.10.3 tqdm==4.36.1 werkzeug==2.2.2
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install fbprophet==0.7.1


FROM base AS runtime

# Copy virtual env from python-deps stage
COPY --from=python-deps /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Create and switch to a new user
RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser

# Install application into container
COPY . .

# Run the application
CMD [ "python", "./src/PythonApplication.py" ]
