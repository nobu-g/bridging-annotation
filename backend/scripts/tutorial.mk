TUTORIAL_DIR := data/tutorial

SHELL := /bin/bash

TUTORIAL_TXT := $(TUTORIAL_DIR)/tutorial.txt
TUTORIAL_KNP := $(TUTORIAL_DIR)/tutorial.knp

$(TUTORIAL_KNP): $(TUTORIAL_TXT)
	cat $< | jumanpp | knp -tab -dpnd-fast > $@

define _SPLIT_SCRIPT
from pathlib import Path
from kyoto_reader import KyotoReader

input_file = Path("${TUTORIAL_DIR}/tutorial.knp")
output_dir = Path("${TUTORIAL_DIR}/knp")
output_dir.mkdir(exist_ok=True)
reader = KyotoReader(input_file, target_cases=[], target_corefs=[], extract_nes=False, n_jobs=0)
for did, knp_string in reader.did2knps.items():
	output_dir.joinpath(f'{did}.knp').write_text(knp_string)
endef
export _SPLIT_SCRIPT

.PHONY: docs
docs: $(TUTORIAL_KNP)
	echo "$${_SPLIT_SCRIPT}" | python

.PHONY: qs
qs: docs
	for path in $(TUTORIAL_DIR)/knp/*; do \
	  name="$$(basename -- "$${path}")"; \
	  out_dir="$(TUTORIAL_DIR)/questions/$${name%.*}" && mkdir -p "$${out_dir}"; \
	  python scripts/gen_questions.py --input-file "$${path}" --output-dir "$${out_dir}"; \
	done

QIDS := \
	CC100ACA20014-q4 \
	CC100BMP88093-q8 \
	CC100BMP80086-q4 \
	CC100HEC85070-q6 \
	CC100BMP15062-q4 \
	CC100JRR41024-q4 \
	CC100AYG73058-q6 \
	CC100ISP60044-q7 \
	CC100BMP12004-q20

ANSWER_TEMPLATES := $(QIDS:%=$(TUTORIAL_DIR)/answers/%.json)

define _ANSWER_SCRIPT
from pathlib import Path
import json
from scripts.json_encoder import MyEncoder, NoIndent

q_path = Path("${TUTORIAL_DIR}/questions") / "${qid}".split('-')[0] / "${qid}.json"
q_obj = json.loads(q_path.read_text())
output_dir = Path("${TUTORIAL_DIR}/answers")
output_dir.mkdir(exist_ok=True)

a_obj = {'qid': q_obj['qid'], 'isSelected': [NoIndent([0])] * len(q_obj['phrases'])}
output_dir.joinpath(q_path.name).write_text(json.dumps(a_obj, cls=MyEncoder, indent=2))
endef
export _ANSWER_SCRIPT

.PHONY: as
as: $(ANSWER_TEMPLATES)
$(ANSWER_TEMPLATES):
	echo "$${_ANSWER_SCRIPT}" | python
