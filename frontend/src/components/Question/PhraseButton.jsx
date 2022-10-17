import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';

import style from './question.module.scss';

const PhraseButton = ({phrase, status, correct, showResult, target, turnSelected, qid}) => {
  const dtid = phrase['dtid'];
  let btnStyle = {};
  if (showResult) {
    if (correct) {
      if (status !== 0) {
        btnStyle = {'borderColor': '#94d19c', 'borderWidth': '.2rem', 'boxSizing': 'border-box'};
      }
    } else {
      btnStyle = {'borderColor': '#d194b0', 'borderWidth': '.2rem', 'boxSizing': 'border-box'};
    }
  }

  return (
    <>
      {phrase.before && <span className={style.vanilla}>{phrase.before}</span>}
      <OverlayTrigger
        placement="top"
        transition={false}
        overlay={
          <Tooltip id={`tooltip-${qid}-${dtid}`}>
            {phrase.core}の{target.core}
          </Tooltip>
        }
      >
        {({ref, ...triggerHandler}) => (
          <Button
            onClick={() => turnSelected(dtid)}
            variant={['inactive', 'active', 'active2'][status]}
            ref={ref}
            {...triggerHandler}
            className={style['phrase-btn']}
            style={btnStyle}
          >
            {phrase.core}
          </Button>
        )}
      </OverlayTrigger>
      {phrase.after && <span className={style.vanilla}>{phrase.after}</span>}
    </>
  );
};

export default React.memo(PhraseButton);
