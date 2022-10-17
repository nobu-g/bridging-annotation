import React from 'react';
import Card from 'react-bootstrap/Card';

import style from './questionview.module.scss';
import {assert} from '../Utils';
import PhraseButton from './PhraseButton';
import NAButton from './NAButton';
import TargetPhrase from '../Question/TargetPhrase';
import SpecialPhraseButton from './SpecialPhraseButton';

const SPECIALS = ['［書き手］', '［読み手］', '［その他（人）］', '［その他（物）］'];
const EXOPHORS = ['著者', '読者', '不特定:人', '不特定:物'];

const QuestionCard = ({question, result, idx}) => {
  const {qid, phrases, target} = question;
  const {maxVotes, votes, goldArguments, goldExophors, maxNaVotes, naVotes} = result;
  assert(result.qid, qid);
  let specials = [];
  if (phrases.length < votes.length) {
    assert(votes.length - phrases.length, SPECIALS.length);
    specials = SPECIALS;
  }
  const cases = ['ノ', 'ノ？', 'トイウ', '修飾'];

  let phrase_to_merge = null;
  return (
    <Card id={'q' + (idx + 1)} className="my-3">
      <Card.Header>問題{idx + 1}</Card.Header>
      <Card.Body>
        {
          process.env.NODE_ENV === 'development' && <>
            <span>(debug) qid: {qid}</span><br/>
          </>
        }
        <div>
          <NAButton
            num={naVotes}
            maxVotes={maxNaVotes}
            qid={qid}
          />
          {
            specials.map((phrase, idx) => {
              const isArgs = cases.filter(c => goldExophors[c] && goldExophors[c].includes(EXOPHORS[idx]));
              return <SpecialPhraseButton
                phrase={phrase}
                num={votes[phrases.length + idx]}
                isArgs={isArgs}
                maxVotes={maxVotes}
                qid={qid}
                key={phrases.length + idx}
              />
            })
          }
          <br/>
          {
            phrases.map((phrase, dtid) => {
              if (phrase_to_merge !== null) {
                phrase = {
                  ...phrase,
                  text: phrase_to_merge['text'] + phrase['text'],
                  before: phrase_to_merge['before'],
                  core: phrase_to_merge['core'] + phrase_to_merge['after'] + phrase['before'] + phrase['core'],
                  after: phrase['after']
                };
                phrase_to_merge = null;
              }
              if (phrase['mergeNext'] === true) {
                phrase_to_merge = phrase;
                return;
              }
              if (!phrase['is_cand'] && phrase['dtid'] !== target['dtid']) {
                return <span className={style.vanilla} key={dtid}>{phrase.text}</span>;
              }
              if (phrase['dtid'] === target['dtid']) {
                return <TargetPhrase phrase={phrase} key={dtid}/>;
              }
              const isArgs = cases.filter(c => goldArguments[c] && goldArguments[c].indexOf(dtid) >= 0);
              return <PhraseButton
                phrase={phrase}
                num={votes[dtid]}
                isArgs={isArgs}
                maxVotes={maxVotes}
                qid={qid}
                key={dtid}
              />;
            })
          }
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuestionCard;
