import React from 'react';
import Card from 'react-bootstrap/Card';

import style from './question.module.scss';
import NAButton from './NAButton';
import TargetPhrase from './TargetPhrase';
import PhraseButton from './PhraseButton';
import SpecialPhraseButton from './SpecialPhraseButton';
import 'components/variants.scss';

export const SPECIALS = ['【書き手】', '【読み手】', '【その他（人）】', '【その他（物）】'];

const QuestionCard = ({
                        question,
                        qidx,
                        isSelected,
                        isNa,
                        turnSelected,
                        turnSelectedNa,
                        answer = null,
                        showResult = false
                      }) => {
  const {qid, phrases, target} = question;
  const special_offset = phrases.length;
  const isCorrectNa = (isSels) => {
    if (isNa === true) {
      return isSels.every(sel => sel.includes(0));
    } else {
      return isSels.some(sel => sel.includes(2));
    }
  };

  let phrase_to_merge = null;
  return (
    <>
      <Card id={'q' + (qidx + 1)} className="mt-3">
        <Card.Header>問題{qidx + 1}</Card.Header>
        <Card.Body>
          <>
            {/*<span>その他の選択肢：</span>*/}
            <NAButton
              turnSelected={turnSelectedNa}
              isNa={isNa}
              correct={answer !== null ? isCorrectNa(answer.isSelected) : true}
              showResult={showResult}
            />
            {
              SPECIALS.map((phrase, idx) => {
                idx += special_offset;
                return <SpecialPhraseButton
                  phrase={phrase}
                  status={isSelected[idx]}
                  correct={answer !== null ? answer.isSelected[idx].includes(isSelected[idx]) : true}
                  showResult={showResult}
                  target={phrases[target['dtid']]}
                  turnSelected={turnSelected}
                  dtid={idx}
                  qid={qid}
                  key={idx}
                />
              })
            }
            <br/>
            {
              phrases.map((phrase, idx) => {
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
                  return <span className={style.vanilla} key={idx}>{phrase.text}</span>;
                }
                if (phrase['dtid'] === target['dtid']) {
                  return <TargetPhrase phrase={phrase} key={idx}/>;
                }
                return <PhraseButton
                  phrase={phrase}
                  status={isSelected[idx]}
                  correct={answer !== null ? answer.isSelected[idx].includes(isSelected[idx]) : true}
                  showResult={showResult}
                  target={phrases[target['dtid']]}
                  turnSelected={turnSelected}
                  qid={qid}
                  key={idx}
                />;
              })
            }
          </>
        </Card.Body>
      </Card>
    </>
  );
};

export default React.memo(QuestionCard);
