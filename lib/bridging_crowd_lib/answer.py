import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Iterator, DefaultDict

import pandas as pd


@dataclass
class Submit:
    task_id: str
    task_num: int
    job_name: str
    submission_time: datetime
    client_ip: str
    questions: Dict[str, List[int]]
    wid: Optional[str] = None

    @classmethod
    def from_json(cls, json_str: str) -> 'Submit':
        data = json.loads(json_str)
        return cls(data['taskId'],
                   data['taskNum'],
                   data['jobName'],
                   datetime.fromisoformat(data['time']),
                   data['ip'],
                   {x['qid']: x['isSelected'] for x in data['questions']})


@dataclass
class Answer:
    """A class to represent a workers' answer for a specific question."""
    qid: str
    num_phrases: int

    def __post_init__(self):
        self.votes: pd.DataFrame = pd.DataFrame(columns=range(self.num_phrases))  # (wid x dtid)

    def add_votes(self, choices: List[int], wid: Optional[str]):
        assert len(choices) == self.num_phrases, f'expected {self.num_phrases} phrases, but got {len(choices)}.'
        self.votes = self.votes.append(pd.Series(choices, name=wid))  # the table extends downward

    def get_freqs(self) -> List[DefaultDict[int, int]]:
        # e.g. [{0: 5, 1: 2, 2: 3}, {...}, ...]
        return [defaultdict(int, col.value_counts().to_dict()) for col in self]

    def get_nas(self) -> int:
        """Return how many workers chose NA for this question."""
        return (self.votes == 0).all(axis='columns').sum().item()

    @property
    def num_workers(self) -> int:
        return len(self.votes.index)

    def __getitem__(self, dtid: int) -> pd.Series:
        """Return each worker's votes for a specific phrase."""
        return self.votes[dtid]

    def __iter__(self) -> Iterator[pd.Series]:
        """Iterate over phrases."""
        return iter(self[i] for i in range(self.num_phrases))

    def __len__(self) -> int:
        """Return the number of phrases this question contains."""
        return self.num_phrases


def build_answers(result_dir: Path, tsv_file: Path) -> Dict[str, Answer]:
    submits: Dict[str, Submit] = {}
    for json_path in result_dir.glob('**/*.json'):
        submit = Submit.from_json(json_path.read_text())
        submits[submit.task_id] = submit

    # set worker id for each submit referring result tsv file
    workers: Dict[str, List[str]] = defaultdict(list)
    bad_workers: Dict[str, List[str]] = defaultdict(list)
    with tsv_file.open() as f:
        for line in f:
            fields = line.strip().split('\t')
            if len(fields) != 11:
                raise ValueError(f'malformed line: {line.strip()}')
            _, _, _, _, _, _, _, _, _, task_id, wid = fields
            task_id = normalize_task_id(task_id)
            if task_id in submits:
                submits[task_id].wid = wid
            elif len(task_id) >= 8:
                for submit in submits.values():
                    if task_id in submit.task_id and submit.wid is None:
                        submit.wid = wid
                        break
                else:
                    bad_workers[wid].append(task_id)
            else:
                bad_workers[wid].append(task_id)
            workers[wid].append(task_id)
    for wid in sorted(bad_workers, key=lambda k: len(bad_workers[k])):
        task_ids = bad_workers[wid]
        print(f'{wid}\t{len(task_ids)}/{len(workers[wid])}\t{task_ids}', file=sys.stderr)
    for submit in submits.values():
        if submit.wid is None:
            submit.wid = f'UNK-{submit.task_id}'

    answers: Dict[str, Answer] = {}
    for task_id, submit in submits.items():
        for qid, votes in submit.questions.items():
            if qid not in answers:
                answers[qid] = Answer(qid, len(votes))
            answers[qid].add_votes(votes, submit.wid)

    return answers


def normalize_task_id(task_id: str) -> str:
    if task_id.startswith('タスクID: '):
        task_id = task_id[7:]
    if task_id.startswith('ヤフー'):
        if (match := re.search(r'[0-9a-f]{16}', task_id)) is not None:
            task_id = match.group()
    task_id = task_id.strip().strip('#')
    return task_id
