import React from 'react';

import style from './question.module.scss';

const TargetPhrase = ({phrase}) => {
  return (
    <>
      {phrase.before && <span className={style.vanilla}>{phrase.before}</span>}
      <span className={style.b}>
        {phrase.core}
      </span>
      {phrase.after && <span className={style.vanilla}>{phrase.after}</span>}
    </>
  );
};

export default React.memo(TargetPhrase);
