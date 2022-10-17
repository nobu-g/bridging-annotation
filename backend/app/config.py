import json
from logging import getLogger
from pathlib import Path
from typing import Callable, Union, Optional

import yaml
from watchdog.events import LoggingEventHandler
from watchdog.observers import Observer

logger = getLogger('uvicorn')


class MyHandler(LoggingEventHandler):
    def __init__(self, handler: Callable, logger_):
        super().__init__(logger=logger_)
        self.handler: Callable = handler

    def on_created(self, event):
        super().on_created(event)
        self.handler()

    def on_deleted(self, event):
        super().on_deleted(event)
        self.handler()

    def on_modified(self, event):
        super().on_modified(event)
        self.handler()


class Config:
    def __init__(self, path: Union[str, Path]):
        self.path: Path = Path(path)
        self.observer = Observer()
        self.observer.schedule(MyHandler(self.load, logger), str(self.path))
        self.observer.start()
        self._config = {}
        self.load()

    def load(self):
        if not self.path.exists():
            self._config = {}
            return
        with self.path.open() as handler:
            self._config = yaml.safe_load(handler)
        logger.info('config reloaded')

    @property
    def data_dir(self) -> Path:
        return Path(self._config['data_dir'])

    @property
    def log_dir(self) -> Path:
        return Path(self._config['log_dir'])

    @property
    def jobs(self) -> dict:
        return self._config['jobs']

    def get_job(self, job_id: str) -> Optional[dict]:
        if job_id not in self.jobs:
            return None
        job = self.jobs[job_id]
        if job['enabled'] is False:
            return None
        return json.loads(Path(job['job_file']).read_text())

    def __getitem__(self, item):
        return self._config[item]
