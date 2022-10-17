import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Union

from bridging_crowd_lib.answer import build_answers, Answer
from bridging_crowd_lib.question import Question
from dataclasses_json import dataclass_json
from fastapi import FastAPI, HTTPException, Request
from kyoto_reader import KyotoReader, Document, BasePhrase, Argument, SpecialArgument
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from .config import Config

config = Config(os.environ.get('CONFIG_FILE', 'config.yml'))

did2doc: Dict[str, Document] = {}


def update_did2doc(question: Question):
    global did2doc
    if question.did in did2doc:
        return
    knp_path = config.data_dir / (question.createdFrom or 'knp')
    reader = KyotoReader(knp_path,
                         target_cases=('ノ', 'ノ？', 'トイウ', '修飾'),
                         extract_nes=False,
                         n_jobs=0)
    if (doc := reader.process_document(question.did)) is None:
        raise ValueError(f'document: {question.did} not found in {knp_path}')
    did2doc[question.did] = doc


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('ACCESS_CONTROL_ALLOW_ORIGIN', '')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class QuestionSubmission(BaseModel):
    qid: str
    isSelected: List[int]


class TaskSubmission(BaseModel):
    taskId: str
    questions: List[QuestionSubmission]


@app.get('/list')
async def get_job_list():
    if config['list_api'] is False:
        raise HTTPException(status_code=503, detail='Service Temporarily Unavailable')
    return [job_id for job_id, job in config.jobs.items() if job['enabled']]


@app.get('/task/{job_id}/{task_num}')
async def get_task(job_id: str, task_num: int):
    if (job_cfg := config.get_job(job_id)) is None:
        raise HTTPException(status_code=404, detail='Job Not Found')
    if config.jobs[job_id]['apis']['task'] is False:
        raise HTTPException(status_code=503, detail='Service Temporarily Unavailable')
    questions: List[dict] = []
    if not (0 <= task_num < len(job_cfg['tasks'])):
        raise HTTPException(status_code=404, detail='Task Not Found')
    for path in job_cfg['tasks'][task_num]['questions']:
        questions.append(json.loads(config.data_dir.joinpath(path).read_text()))
    return {'questions': questions}


@app.get('/tutorial/{job_id}/{task_num}')
async def get_task(job_id: str, task_num: int):
    if (job_cfg := config.get_job(job_id)) is None:
        raise HTTPException(status_code=404, detail='Job Not Found')
    if config.jobs[job_id]['apis']['task'] is False:
        raise HTTPException(status_code=503, detail='Service Temporarily Unavailable')
    questions: List[dict] = []
    answers: List[dict] = []
    if not (0 <= task_num < len(job_cfg['tasks'])):
        raise HTTPException(status_code=404, detail='Tutorial Not Found')
    for path in job_cfg['tasks'][task_num]['tutorialQuestions']:
        questions.append(json.loads(config.data_dir.joinpath(path).read_text()))
    for path in job_cfg['tasks'][task_num]['tutorialAnswers']:
        answers.append(json.loads(config.data_dir.joinpath(path).read_text()))
    return {'questions': questions, 'answers': answers}


@app.post('/submit/{job_id}/{task_num}')
async def submit(job_id: str, task_num: int, result: TaskSubmission, request: Request):
    if (job_cfg := config.get_job(job_id)) is None:
        raise HTTPException(status_code=404, detail='Job Not Found')
    if config.jobs[job_id]['apis']['submit'] is False:
        raise HTTPException(status_code=503, detail='Service Temporarily Unavailable')
    save_dir = config.data_dir / 'result' / job_cfg['jobName'] / str(task_num)
    save_dir.mkdir(exist_ok=True, parents=True)
    now = datetime.now(timezone(timedelta(hours=+9), name='JST'))
    data = {
        'jobName': job_cfg['jobName'],
        'taskNum': task_num,
        'taskId': result.taskId,
        'time': str(now),
        'ip': request.client.host,
        'questions': [{'qid': q.qid, 'isSelected': q.isSelected} for q in result.questions]
    }
    with save_dir.joinpath(now.strftime(r'%m%d_%H%M%S') + '.json').open(mode='w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=False)
    return {}


@app.get('/result/{mode}/{job_id}/{task_num}')
async def get_task(mode: str, job_id: str, task_num: int) -> List[dict]:
    if (job_cfg := config.get_job(job_id)) is None:
        raise HTTPException(status_code=404, detail='Job Not Found')
    if config.jobs[job_id]['apis']['result'] is False:
        raise HTTPException(status_code=503, detail='Service Temporarily Unavailable')
    if not (0 <= task_num < len(job_cfg['tasks'])):
        raise HTTPException(status_code=404, detail='Task Not Found')

    questions: Dict[str, Question] = {}
    for path in job_cfg['tasks'][task_num]['questions']:
        q: Question = Question.from_json(config.data_dir.joinpath(path).read_text())
        questions[q.qid] = q
        update_did2doc(q)

    result_dir = config.data_dir / 'result' / job_cfg['jobName']
    answers: Dict[str, Answer] = build_answers(result_dir / str(task_num), result_dir / f'{job_cfg["jobName"]}.tsv')

    def freq2num(freq: Dict[int, int]):
        num = 0
        if mode in ('single', 'both'):
            num += freq[2]
        if mode in ('multi', 'both'):
            num += freq[1] + freq[2]
        return num

    data = []
    for qid, answer in answers.items():
        q = questions[qid]
        anaphor: BasePhrase = did2doc[q.did].bp_list()[q.target['dtid']]
        arguments = did2doc[q.did].get_arguments(anaphor, relax=True)
        max_votes = 0
        if mode in ('single', 'both'):
            max_votes += answer.num_workers
        if mode in ('multi', 'both'):
            max_votes += answer.num_workers

        data.append(
            {
                'qid': qid,
                'maxVotes': max_votes,
                'votes': list(map(freq2num, answer.get_freqs())),
                'goldArguments': {
                    case: [arg.dtid for arg in args if isinstance(arg, Argument)] for case, args in arguments.items()
                },
                'goldExophors': {
                    case: [arg.exophor for arg in args if isinstance(arg, SpecialArgument)] for case, args in arguments.items()
                },
                'maxNaVotes': answer.num_workers,
                'naVotes': answer.get_nas(),
            }
        )

    return data


@dataclass_json
@dataclass(frozen=True)
class QuestionResult:
    qid: str
    did: str
    target: Dict[str, Union[str, int]]  # keys: sid, tid, dtid
    votes: List[Dict[str, int]]
    exophors: Dict[str, Dict[str, int]]
    null: int
    num_workers: int


@app.get('/predict/{expr}/{run_id}/{eval_set}/{corpus}/{idx}')
async def get_task(expr: str, run_id: str, eval_set: str, corpus: str, idx: int) -> List[dict]:
    dataset_dir = Path(config['ds_dir'])
    gold_jsonl_dir = dataset_dir / eval_set / 'jsonl'
    question_dir = Path(config['question_dir'])
    prediction_dir = Path(config['result_dir']) / expr / run_id / f'pred_{eval_set}' / corpus
    gold_dir = Path(config['result_dir']) / expr / run_id / f'gold_{eval_set}' / corpus

    data = []
    num_docs_per_page = 5
    doc_ids = [p.stem for p in prediction_dir.iterdir()]
    for doc_id in (doc_ids[idx * num_docs_per_page: (idx + 1) * num_docs_per_page] if idx >= 0 else doc_ids):
        preds: List[List[float]] = json.loads(prediction_dir.joinpath(f'{doc_id}.json').read_text())
        golds: List[List[float]] = json.loads(gold_dir.joinpath(f'{doc_id}.json').read_text())
        num_phrases = max(len(ps) for ps in preds)
        for line in gold_jsonl_dir.joinpath(f'{doc_id}.jsonl').read_text().splitlines():
            result: QuestionResult = QuestionResult.from_json(line.strip())
            q_path = question_dir / doc_id / f'{result.qid}.json'
            question: Question = Question.from_json(q_path.read_text())
            pred_votes: List[float] = [v for v in preds[question.target['dtid']] or [.0] * num_phrases]
            gold_votes: List[float] = [v for v in golds[question.target['dtid']] or [.0] * num_phrases]
            update_did2doc(question)
            anaphor: BasePhrase = did2doc[question.did].bp_list()[question.target['dtid']]
            arguments = did2doc[question.did].get_arguments(anaphor, relax=True)

            data.append(
                {
                    'question': question,
                    'maxVotes': result.num_workers * 2,
                    'maxNaVotes': result.num_workers * 2,
                    'votes': pred_votes[:-1],
                    'naVotes': pred_votes[-1],
                    'goldVotes': gold_votes[:-1],
                    'goldNaVotes': gold_votes[-1],
                    'goldArguments': {
                        case: [arg.dtid for arg in args if isinstance(arg, Argument)] for case, args in
                        arguments.items()
                    },
                    'goldExophors': {
                        case: [arg.exophor for arg in args if isinstance(arg, SpecialArgument)] for case, args in
                        arguments.items()
                    },
                }
            )

    return data

# if __name__ == '__main__':
#     parser = argparse.ArgumentParser()
#     parser.add_argument('--job', required=True, type=(lambda p: Path(p)),
#                         help='job file')
#     parser.add_argument('--host', default='0.0.0.0', type=str,
#                         help='host ip address (default: 0.0.0.0)')
#     parser.add_argument('--port', default=12345, type=int,
#                         help='host port number (default: 12345)')
#     args = parser.parse_args()
#     job_name: str = args.job.stem
#     with args.job.open() as f_job:
#         job = json.load(f_job)
#     job_dir = data_dir / 'result' / job_name
#     job_dir.mkdir(exist_ok=True)
#
#     uvicorn.run(app, host=args.host, port=args.port, workers=0, log_level="info")
