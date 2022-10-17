from dataclasses import dataclass, field
from typing import Dict, Union, List, Optional

from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class Phrase:
    dtid: int
    text: str
    before: str
    core: str
    after: str
    is_cand: bool
    sid: str
    tid: int


@dataclass_json
@dataclass
class Question:
    qid: str
    qidx: int
    did: str
    target: Dict[str, Union[str, int]]  # keys: sid, tid, dtid
    phrases: List[Phrase]
    createdFrom: Optional[str] = field(default=None)  # path to source knp file
