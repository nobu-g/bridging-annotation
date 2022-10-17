# Bridging Annotation: a tool for collecting annotations for bridging reference using crowdsourcing

## Preparing source data

1. `cd backend`
2. Place source KNP files in `backend/data/knp`.
3. Run `make all -j 64 N_TASKS=50 JOB_NAME=<job-name>`.

## Starting backend server

1. SSH to the host on which you want to start a server.
2. Edit `backend/config.yml`.
    - Set appropriate job file referring to `backend/data/jobs/`.
3. `CONFIG_FILE=config.yml uvicorn main.app:app --host 0.0.0.0 --port 12345 --proxy-headers --forwarded-allow-ips='*' &>> log/uvicorn.log &`

## Deploy codes for frontend

1. `cd frontend`
2.  Set `"homepage"` field in `package.json` correctly.
3. Build and deploy using `yarn`.

    ```shell
    yarn build && rsync -aPvh --delete build/ <web-host>:<path-to-www-root-directory>
    ```
