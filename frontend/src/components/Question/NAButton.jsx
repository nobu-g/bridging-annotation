import React from 'react';
import Button from 'react-bootstrap/Button';
import style from './question.module.scss';

const NAButton = ({turnSelected, isNa, correct, showResult = false}) => {
  let btnStyle = (() => {
    if (!showResult) {
      return {'borderWidth': '2px'};
    }
    if (correct) {
      if (isNa) {
        return {'borderColor': '#94d19c', 'borderWidth': '.2rem', 'boxSizing': 'border-box'};
      }
    } else {
      return {'borderColor': '#d194b0', 'borderWidth': '.2rem', 'boxSizing': 'border-box'};
    }
    return {'borderWidth': '2px'};
  })();

  return (
    <Button
      onClick={() => turnSelected()}
      variant={isNa ? 'na-active' : 'na-inactive'}
      className={style['phrase-btn']}
      style={btnStyle}
    >
      <b>
        【該当なし】
      </b>
    </Button>
  );
};

export default React.memo(NAButton);
