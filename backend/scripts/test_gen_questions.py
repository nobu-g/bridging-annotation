from pathlib import Path
from dataclasses import dataclass, astuple
from typing import List

import pytest
from dataclasses_json import dataclass_json
from pyknp import KNP

from gen_questions import is_target, is_candidate, core


@dataclass_json
@dataclass
class Case:
    text: str
    targets: List[str]
    candidates: List[str]


data_dir = Path(__file__).parent / 'data'
cases = [Case.from_json(path.read_text()) for path in data_dir.iterdir()]


@pytest.mark.parametrize('text, targets, candidates', [astuple(c) for c in cases])
def test_is_target(text: str, targets: List[str], candidates: List[str]):
    knp = KNP()
    result = knp.parse(text)
    contents = []
    for tag in result.tag_list():
        if is_target(tag) is True:
            _, content, _ = core(tag)
            contents.append(content)
    assert contents == targets


@pytest.mark.parametrize('text, targets, candidates', [astuple(c) for c in cases])
def test_is_candidate(text: str, targets: List[str], candidates: List[str]):
    knp = KNP()
    result = knp.parse(text)
    target_tag = result.tag_list()[-1]
    contents = []
    for tag in result.tag_list():
        if is_candidate(tag, target_tag.tag_id, 0, 0) is True:
            _, content, _ = core(tag)
            contents.append(content)
    assert contents == candidates
