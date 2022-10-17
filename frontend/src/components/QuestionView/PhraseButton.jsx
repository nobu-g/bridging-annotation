import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import style from './questionview.module.scss';

const PhraseButton = ({phrase, num, isArgs, maxVotes, qid}) => {
  const dtid = phrase['dtid'];
  const hue = 188;
  const saturation = 50 + 50 * (num / maxVotes);
  const luminance = 100 - 70 * (num / maxVotes);
  const color = `hsl(${hue}, ${saturation}%, ${luminance}%)`;

  return (
    <>
      {phrase.before && <span className={style.vanilla}>{phrase.before}</span>}
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${qid}-${dtid}`}>
            {num.toFixed(1)}/{maxVotes}, {isArgs}
          </Tooltip>
        }
      >
        {({ref, ...triggerHandler}) => (
          <span
            className={isArgs.includes('ノ') || isArgs.includes('ノ？') ? style.gold : style.a}
            style={{'backgroundColor': color}}
            ref={ref}
            {...triggerHandler}
          >
          {phrase.core}
        </span>
        )}
      </OverlayTrigger>
      {phrase.after && <span className={style.vanilla}>{phrase.after}</span>}
    </>
  );
};

export default PhraseButton;
