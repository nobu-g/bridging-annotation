import React, {useCallback} from 'react';

import QuestionCard from '../Question/QuestionCard';
import 'components/variants.scss';

const Question = ({question, isSelected, isNa, dispatch, idx}) => {
  const {qid} = question;

  const setIsSelected = useCallback((upd) => {
    dispatch({type: 'setIsSelected', value: upd, qid: qid});
  }, [dispatch, qid]);

  const setIsNa = useCallback((upd) => {
    dispatch({type: 'setIsNa', value: upd, qid: qid});
  }, [dispatch, qid]);

  const turnSelected = useCallback((index) => {
    setIsSelected(prev => {
      let next;
      if (prev[index] === 1) {
        // next[index] が2になるので他の2があれば1に変える
        next = prev.slice().map(st => Math.min(st, 1));
      } else {
        next = prev.slice();
      }
      next[index] = (prev[index] + 1) % 3;
      return next
    });

    setIsNa(() => false);
  }, [setIsNa, setIsSelected]);
  const turnSelectedNa = useCallback(() => {
    if (!isNa) {
      setIsSelected(prev => Array(prev.length).fill(0));
    }
    setIsNa(prev => !prev);
  }, [isNa, setIsNa, setIsSelected]);

  return <QuestionCard
            question={question}
            qidx={idx}
            isSelected={isSelected}
            isNa={isNa}
            turnSelected={turnSelected}
            turnSelectedNa={turnSelectedNa}
        />
};

export default React.memo(Question);
