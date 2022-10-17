N_QUESTIONS := 10
N_TASKS :=
DATA_DIR := data
JOB_NAME := $(shell date "+%y%m%d-%H")
TSV_NAME := $(JOB_NAME)
FROM :=
DID_FILE :=

PYTHON := $(shell which python)

KNP_DIR := $(DATA_DIR)/knp
QUESTION_DIR := $(DATA_DIR)/questions
TUTORIAL_DIR := $(DATA_DIR)/tutorial
JOB_FILE := $(DATA_DIR)/jobs/$(JOB_NAME).json
TSV_FILE := $(DATA_DIR)/jobs/$(TSV_NAME).tsv
KNPS := $(wildcard $(KNP_DIR)/*.knp)
JSON_DIRS := $(patsubst $(KNP_DIR)/%.knp,$(QUESTION_DIR)/%,$(KNPS))
SCRIPTS_DIR := scripts

GEN_JOB_ARGS := --job-name $(JOB_NAME) --input-dir $(QUESTION_DIR) --tutorial-dir $(TUTORIAL_DIR) \
--questions $(N_QUESTIONS)
ifdef N_TASKS
	GEN_JOB_ARGS += --tasks $(N_TASKS)
endif
ifdef FROM
	GEN_JOB_ARGS += --qid-from $(FROM)
endif
ifdef DID_FILE
	GEN_JOB_ARGS += --did-file $(DID_FILE)
endif

.PHONY: all
all: job tsv

.PHONY: job
job: $(JOB_FILE)

$(JOB_FILE): qs
	mkdir -p $(dir $@) && \
	$(PYTHON) $(SCRIPTS_DIR)/gen_job.py $(GEN_JOB_ARGS) > $@ || rm -f $@

.PHONY: tsv
tsv: $(TSV_FILE)

$(TSV_FILE): $(JOB_FILE)
	mkdir -p $(dir $@) && $(PYTHON) $(SCRIPTS_DIR)/gen_tsv.py --job-file $^ > $@ || rm -f $@

.PHONY: qs
qs: $(JSON_DIRS)

$(JSON_DIRS): $(QUESTION_DIR)/%: $(KNP_DIR)/%.knp
	mkdir -p $(dir $@) && \
	$(PYTHON) $(SCRIPTS_DIR)/gen_questions.py --input-file $^ --output-dir $@ || rm -rf $@
