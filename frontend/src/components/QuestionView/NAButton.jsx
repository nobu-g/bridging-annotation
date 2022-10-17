import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import style from './questionview.module.scss';

const NAButton = ({num, maxVotes, qid}) => {
  const hue = 188;
  const saturation = 50 + 50 * (num / maxVotes);
  const luminance = 100 - 70 * (num / maxVotes);
  const color = `hsl(${hue}, ${saturation}%, ${luminance}%)`;

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${qid}-na`}>
          {num.toFixed(1)}/{maxVotes}
        </Tooltip>
      }
    >
      {({ref, ...triggerHandler}) => (
        <span
          className={'mr-5 ' + style.na}
          style={{'backgroundColor': color}}
          ref={ref}
          {...triggerHandler}
        >
          【該当なし】
        </span>
      )}
    </OverlayTrigger>
  );
};

export default React.memo(NAButton);
