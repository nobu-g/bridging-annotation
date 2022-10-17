import argparse
import json
import os
import re
from pathlib import Path
from typing import List, Tuple

from pyknp import BList, Tag
from pyknp.utils.loader import load_knp_from_stream

DATA_DIR = Path(os.environ.get('DATA_DIR', 'data')).resolve()
KANJI_PTN = re.compile(r'[\u3005\u3006\u4E00-\u9FFF]+')


def is_kanji(s: str) -> bool:
    return bool(KANJI_PTN.fullmatch(s))


def is_target(tag: Tag) -> bool:
    # 項を取らない体言が対象
    if not ('体言' in tag.features and '非用言格解析' not in tag.features):
        return False

    mrph_list = tag.mrph_list()
    # 名詞などを含まない基本句は除外
    if not any(mrph.hinsi in ('指示詞', '未定義語') or (mrph.hinsi == '名詞' and mrph.bunrui != '形式名詞') for mrph
               in mrph_list):
        return False

    # 数詞を含む基本句は除外
    if any(mrph.bunrui == '数詞' for mrph in mrph_list):
        return False

    # 助詞などが付いている基本句はヘッドなので採用
    if mrph_list[-1].hinsi in ('助詞', '特殊', '判定詞'):
        return True

    if parent := tag.parent:
        # 係り先が次の基本句かつ体言
        if parent.tag_id - tag.tag_id == 1 and '体言' in parent.features:
            if all(mrph.hinsi in ('助詞', '特殊', '判定詞', '接尾辞') for mrph in parent.mrph_list()):
                return True
            if '非用言格解析' in parent.features or '用言' in parent.features:
                return True
            return False
    return True


def is_candidate(tag: Tag, ttid: int, sidx: int, tsidx: int) -> bool:
    # 文間後方照応は捨てる
    if sidx > tsidx or (sidx == tsidx and tag.tag_id == ttid):
        return False

    # 体言でないものも捨てる
    if '体言' not in tag.features:
        return False

    # 名詞などを含まない基本句も捨てる
    if not any(mrph.hinsi in ('動詞', '形容詞', '名詞', '指示詞', '未定義語', '接尾辞') for mrph in tag.mrph_list()):
        return False

    return True


def get_is_compound_subs(blist: BList) -> List[bool]:
    """文中の各基本句が，次に1文字漢字が続く複合語基本句か
    例) "日本 標準 時" -> [False, True, False]
    """
    ret = []
    tag_list = blist.tag_list()
    for tid in range(len(tag_list) - 1):
        tag = tag_list[tid]
        next_tag = tag_list[tid + 1]
        if tag.parent.tag_id == next_tag.tag_id:
            before, content, after = core(tag)
            if is_kanji(content) and after == '' and '一文字漢字' in next_tag.features:
                ret.append(True)
                continue
        ret.append(False)
    ret.append(False)
    assert len(tag_list) == len(ret)
    return ret


def get_target_mask(blist: BList) -> List[bool]:
    is_compound_subs = get_is_compound_subs(blist)
    mask: List[bool] = []
    for tag in blist.tag_list():
        mask.append(is_target(tag) is True and is_compound_subs[tag.tag_id] is False)
    return mask


def core(tag: Tag) -> Tuple[str, str, str]:
    """助詞等を除いた中心的表現"""
    mrph_list = tag.mrph_list()
    sidx = 0
    for i, mrph in enumerate(mrph_list):
        if mrph.hinsi not in ('助詞', '特殊', '判定詞', '助動詞', '接続詞'):
            sidx += i
            break
    eidx = len(mrph_list)
    for i, mrph in enumerate(reversed(mrph_list)):
        if mrph.hinsi not in ('助詞', '特殊', '判定詞', '助動詞', '接続詞'):
            eidx -= i
            break
    if sidx >= eidx:
        return '', tag.midasi, ''
    before = ''.join(mrph.midasi for mrph in mrph_list[:sidx])
    content = ''.join(mrph.midasi for mrph in mrph_list[sidx:eidx])
    after = ''.join(mrph.midasi for mrph in mrph_list[eidx:])
    return before, content, after


def new_phrases(blists: List[BList], tsidx: int, ttid: int):
    phrases = []
    dtid = 0
    for sidx, blist in enumerate(blists):
        is_compound_subs = get_is_compound_subs(blist)
        for tag in blist.tag_list():
            is_compound_sub = is_compound_subs[tag.tag_id]
            phrases.append(
                {'dtid': dtid,
                 'text': tag.midasi,
                 **dict(zip(('before', 'core', 'after'), core(tag))),
                 'is_cand': is_candidate(tag, ttid, sidx, tsidx) and is_compound_sub is False,
                 'sid': blist.sid,
                 'tid': tag.tag_id,
                 'mergeNext': is_compound_sub,
                 }
            )
            dtid += 1
    return phrases


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-file', '-i', required=True, type=str,
                        help='path to input knp file')
    parser.add_argument('--output-dir', '-o', required=True, type=str,
                        help='path to output json directory whose name is did')
    args = parser.parse_args()

    input_file = Path(args.input_file).resolve()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)

    with input_file.open() as f:
        blists: List[BList] = list(load_knp_from_stream(f))

    qidx = 0  # qidx は文書レベルの通し番号
    did = input_file.stem
    dtid = 0  # document-wide tag id
    for sidx, blist in enumerate(blists):
        target_mask = get_target_mask(blist)
        for tag in blist.tag_list():
            phrases = new_phrases(blists, sidx, tag.tag_id)
            if target_mask[tag.tag_id] is True:
                qid = f'{did}-q{qidx}'
                data = {
                    'qid': qid,
                    'qidx': qidx,
                    'did': did,
                    'createdFrom': str(
                        input_file.relative_to(DATA_DIR) if DATA_DIR in input_file.parents else input_file),
                    'target': {
                        'sid': blist.sid,
                        'tid': tag.tag_id,
                        'dtid': dtid,
                    },
                    'phrases': phrases,
                }
                with output_dir.joinpath(f'{qid}.json').open(mode='w') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=False)
                qidx += 1
            dtid += 1


if __name__ == '__main__':
    main()
