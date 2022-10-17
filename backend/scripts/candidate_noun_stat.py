import argparse
from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from kyoto_reader import KyotoReader, Document, BasePhrase, Sentence, Argument
from pyknp import Tag

RELS = ('ノ', 'ノ？', 'トイウ', '修飾')


def is_candidate_all(*_) -> bool:
    return True


def is_candidate_baseline(tag: Tag, ttid: int, sidx: int, tsidx: int) -> bool:
    return sidx < tsidx or (sidx == tsidx and tag.tag_id != ttid)


def is_candidate_noun(tag: Tag, ttid: int, sidx: int, tsidx: int) -> bool:
    if not is_candidate_baseline(tag, ttid, sidx, tsidx):
        return False

    if is_candidate_pred(tag) is True:
        if tag.parent and tag.parent.tag_id == ttid and sidx == tsidx:
            return True
        return False

    return True


def is_candidate_pred(tag: Tag, *_) -> bool:
    return '体言' not in tag.features and '用言' in tag.features


def is_candidate_pred_dep(tag: Tag, ttid: int, sidx: int, tsidx: int) -> bool:
    return is_candidate_pred(tag) and tag.parent and tag.parent.tag_id == ttid and sidx == tsidx


def is_candidate_cataphora(tag: Tag, ttid: int, sidx: int, tsidx: int) -> bool:
    return tsidx < sidx or (sidx == tsidx and ttid < tag.tag_id)


@dataclass(frozen=True)
class Example:
    argument: BasePhrase
    anaphor: BasePhrase
    document: Document

    def __str__(self):
        sentence: Sentence = self.document[self.anaphor.sid]
        return f'{sentence.sid},{sentence},{self.argument.core},{self.anaphor.core},'


@dataclass
class Measure:
    """A data class to calculate and represent F-measure"""
    denom_pred: int = 0
    denom_gold: int = 0
    correct: int = 0

    def __add__(self, other: 'Measure'):
        return Measure(self.denom_pred + other.denom_pred,
                       self.denom_gold + other.denom_gold,
                       self.correct + other.correct)

    @property
    def precision(self) -> float:
        if self.denom_pred == 0:
            return .0
        return self.correct / self.denom_pred

    @property
    def recall(self) -> float:
        if self.denom_gold == 0:
            return .0
        return self.correct / self.denom_gold

    @property
    def f1(self) -> float:
        if self.denom_pred + self.denom_gold == 0:
            return .0
        return 2 * self.correct / (self.denom_pred + self.denom_gold)


@dataclass
class RetValue:
    measure: Measure = field(default_factory=Measure)
    examples: List[Example] = field(default_factory=list)

    def __add__(self, other: 'RetValue'):
        return RetValue(self.measure + other.measure,
                        self.examples + other.examples)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--knp-dir', required=True, type=str,
                        help='path to data directory')
    parser.add_argument('--debug', action='store_true', default=False,
                        help='debug mode')
    args = parser.parse_args()

    reader = KyotoReader(args.knp_dir, target_cases=RELS, extract_nes=False)

    conditions = ('all', 'baseline', 'noun', 'pred', 'pred_dep', 'cataphora')
    stats = {cond: RetValue() for cond in conditions}
    is_candidates = (is_candidate_all,
                     is_candidate_baseline,
                     is_candidate_noun,
                     is_candidate_pred,
                     is_candidate_pred_dep,
                     is_candidate_cataphora)
    for document in reader.process_all_documents():
        sid2sidx = {sent.sid: idx for idx, sent in enumerate(document)}
        for anaphor in document.bp_list():
            arguments = document.get_arguments(anaphor, relax=False)
            args_gold = [arg for rel in RELS for arg in arguments[rel] if isinstance(arg, Argument)]
            gold_dtids = set(arg.dtid for arg in args_gold)

            for cond, is_candidate in zip(conditions, is_candidates):
                stat = stats[cond]

                args_pred = [bp for bp in document.bp_list()
                             if is_candidate(bp.tag, anaphor.tid, sid2sidx[bp.sid], sid2sidx[anaphor.sid])]
                stat.measure.denom_gold += len(args_gold)
                stat.measure.denom_pred += len(args_pred)
                stat.measure.correct += len(gold_dtids & set(arg.dtid for arg in args_pred))
                for arg in args_pred:
                    if arg.dtid in gold_dtids:
                        stat.examples.append(Example(arg, anaphor, document))

    for cond in conditions:
        stat = stats[cond]
        print(f'{cond}:')
        print(f'  precision: {stat.measure.precision:.4f} ({stat.measure.correct}/{stat.measure.denom_pred})')
        print(f'  recall   : {stat.measure.recall:.4f} ({stat.measure.correct}/{stat.measure.denom_gold})')
        print(f'  F        : {stat.measure.f1:.4f}')

        Path(f'cand_examples_{cond}.txt').write_text('\n'.join(str(e) for e in stat.examples) + '\n')


if __name__ == '__main__':
    main()
