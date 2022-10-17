import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import style from './questionview.module.scss';

const SpecialPhraseButton = ({phrase, num, isArgs, maxVotes, qid}) => {
  const hue = 188;
  const saturation = 50 + 50 * (num / maxVotes);
  const luminance = 100 - 70 * (num / maxVotes);
  const color = `hsl(${hue}, ${saturation}%, ${luminance}%)`;

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${qid}-${phrase}`}>
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
          {phrase}
        </span>
      )}
    </OverlayTrigger>
  );
};

export default SpecialPhraseButton;
