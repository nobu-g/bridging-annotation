FROM python:3.8-slim-bullseye
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip --no-cache-dir \
    && pip install poetry --no-cache-dir
COPY backend/pyproject.toml backend/poetry.lock ./
COPY lib /app/lib
RUN poetry install --no-dev

ENV ACCESS_CONTROL_ALLOW_ORIGIN "http://localhost:3000"
ENV JOB_FILE "data/jobs/job-test.json"
ENTRYPOINT ["poetry", "run"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]
