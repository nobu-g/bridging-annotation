# print a JSON string which describes a job from question files (data/questions/{did}/{qid}.json)
# usage:
# $ python gen_tasks.py --input-dir data/questions --questions 10 --tasks 5 --did-from w001 > job.json

import argparse
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from itertools import count
from pathlib import Path
from typing import List, Optional, Set, Tuple

QID_PTN = re.compile(r'^(?P<did>.*)-q(?P<qidx>\d+)$')

TUTORIAL_QUESTIONS1 = (
    ('CC100ACA20014', 'CC100ACA20014-q4'),
    ('CC100BMP88093', 'CC100BMP88093-q9'),
    ('CC100BMP80086', 'CC100BMP80086-q5'),
    ('CC100AYG73058', 'CC100AYG73058-q7'),
    ('CC100HEC85070', 'CC100HEC85070-q7'),
)

TUTORIAL_QUESTIONS2 = (
    ('CC100JRR41024', 'CC100JRR41024-q4'),
    ('CC100BMP15062', 'CC100BMP15062-q4'),
    ('CC100CWL62077', 'CC100CWL62077-q9'),
)

TUTORIAL_QUESTIONS3 = (
    ('CC100ISP60044', 'CC100ISP60044-q8'),
    ('CC100BMP12004', 'CC100BMP12004-q21'),
)

DATA_DIR = Path(os.environ.get('DATA_DIR', 'data')).resolve()


@dataclass(frozen=True)
class QuestionFile:
    qid: str
    qidx: int
    did: str
    path: Path

    @classmethod
    def from_path(cls, path: Path) -> 'QuestionFile':
        qid = path.stem
        match = QID_PTN.search(qid)
        assert match is not None, f'invalid path: {path}'
        did = match.group('did')
        qidx = int(match.group('qidx'))
        assert did == path.parent.stem, f'invalid path: {path}'
        return cls(qid, qidx, did, path)

    def __eq__(self, other):
        return self.qid == other.qid and self.did == other.did

    def __ge__(self, other):
        if self.did == other.did:
            return self.qidx >= other.qidx
        else:
            return self.did >= other.did

    def __gt__(self, other):
        if self.did == other.did:
            return self.qidx > other.qidx
        else:
            return self.did > other.did


def list_questions(input_dir: Path,
                   qid_from: Optional[str],
                   did_file: Optional[str],
                   ) -> List[QuestionFile]:
    all_question_files = []
    for p in input_dir.glob('*/*.json'):
        all_question_files.append(QuestionFile.from_path(p))
    all_question_files.sort()

    if did_file is not None:
        dids: Set[str] = set()
        with open(did_file) as f:
            for line in f:
                if not line.strip() or line.startswith('#'):
                    continue
                dids.add(line.strip())
    else:
        dids: Set[str] = set(qf.did for qf in all_question_files)  # all dids

    if qid_from is not None:
        qid_from_idx = next(i for i, qf in enumerate(all_question_files) if qf.qid == qid_from)
    else:
        qid_from_idx = 0
    return [qf for qf in all_question_files[qid_from_idx:] if qf.did in dids]


def gen_tasks(question_files: List[QuestionFile],
              num_questions: int,
              num_tasks: Optional[int],
              tutorial_dir: Path,
              ) -> Tuple[List[dict], Set[str]]:
    relative_tutorial_dir = tutorial_dir.resolve().relative_to(DATA_DIR)
    tasks = []
    dids: Set[str] = set()
    sidx = 0
    for i in count():
        eidx = sidx + num_questions
        if num_tasks is not None:
            if i >= num_tasks:
                break
            if eidx > len(question_files):
                raise ValueError('There are not enough questions. '
                                 'Consider reducing the number of tasks or preparing additional questions')
        if sidx >= len(question_files):
            break
        task = {'taskNum': i, 'tutorialQuestions': [], 'tutorialAnswers': [], 'questions': []}
        for tutorial_questions in (TUTORIAL_QUESTIONS1, TUTORIAL_QUESTIONS2, TUTORIAL_QUESTIONS3):
            did, qid = tutorial_questions[i % len(tutorial_questions)]
            task['tutorialQuestions'].append(f'{relative_tutorial_dir}/questions/{did}/{qid}.json')
            task['tutorialAnswers'].append(f'{relative_tutorial_dir}/answers/{qid}.json')
        task['questions'] += [str(qf.path.resolve().relative_to(DATA_DIR)) for qf in question_files[sidx:eidx]]
        dids |= {qf.did for qf in question_files[sidx:eidx]}
        tasks.append(task)
        sidx = eidx

    return tasks, dids


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-name', '-j', required=True, type=str,
                        help='the name of job which is unique and distinguishable')
    parser.add_argument('--input-dir', '-i', required=True, type=str,
                        help='path to input directory where question files exist')
    parser.add_argument('--tutorial-dir', default='tutorial', type=str,
                        help='path to input directory where tutorial question files exist')
    parser.add_argument('--questions', '-q', default=10, type=int,
                        help='number of questions per task')
    parser.add_argument('--tasks', '-t', default=None, type=int,
                        help='number of tasks')
    parser.add_argument('--qid-from', default=None, type=str,
                        help='qid which this task start with')
    parser.add_argument('--did-file', default=None, type=str,
                        help='path to file that contains list of dids')
    args = parser.parse_args()

    question_files: List[QuestionFile] = list_questions(Path(args.input_dir), args.qid_from, args.did_file)
    tasks, dids = gen_tasks(question_files,
                            num_questions=args.questions,
                            num_tasks=args.tasks,
                            tutorial_dir=Path(args.tutorial_dir),
                            )
    data = {
        'jobName': args.job_name,
        'numTasks': len(tasks),
        'numDocs': len(dids),
        'numQuestionsPerTask': args.questions,
        'numQuestions': sum(len(task['questions']) for task in tasks),
        'createdAt': str(datetime.now(timezone(timedelta(hours=+9), name='JST'))),
        'tasks': tasks,
    }
    print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False))


if __name__ == '__main__':
    main()
