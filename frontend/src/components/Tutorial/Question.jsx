import React, {useCallback, useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import QuestionCard from '../Question/QuestionCard';
import 'components/variants.scss';
import {assert} from '../Utils';

const ValidationResult = ({correct, desc, setShowResult}) => {
  if (correct) {
    return (
      <Alert variant='success' className="mt-2 mb-0" onClose={() => setShowResult(false)} dismissible>
        <Alert.Heading>{'正解です！'}</Alert.Heading>
        <p>{desc}</p>
      </Alert>
    );
  } else {
    return (
      <Alert variant='danger' className="mt-2 mb-0" onClose={() => setShowResult(false)} dismissible>
        <Alert.Heading>{'間違いがあります'}</Alert.Heading>
        <p>{desc}</p>
      </Alert>
    );
  }
};

const UnenteredErrorAlert = ({setUnenteredError}) => {
  return (
    <Alert variant='danger' onClose={() => setUnenteredError(false)} dismissible className="mt-2 mb-0">
      {/*<Alert.Heading>{'入力が完了していません'}</Alert.Heading>*/}
      入力が完了していません
    </Alert>
  );
};

const Question = ({question, answer, isSelected, isNa, dispatch, idx}) => {
  const {qid} = question;
  assert(qid, answer.qid);
  const [showResult, setShowResult] = useState(false);
  const [unenteredError, setUnenteredError] = useState(false);

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
      return next;
    });

    setIsNa(() => false);
    setShowResult(false);
  }, [setIsNa, setIsSelected]);
  const turnSelectedNa = useCallback(() => {
    if (!isNa) {
      setIsSelected(prev => Array(prev.length).fill(0));
    }
    setIsNa(prev => !prev);
    setShowResult(false);
  }, [isNa, setIsNa, setIsSelected]);

  const validate = useCallback(() => {
    if (isSelected.every(sel => sel < 2) && isNa === false) {
      setUnenteredError(true);
    } else {
      setUnenteredError(false);
      setShowResult(true);
    }
  }, [isSelected, isNa]);

  return (
    <>
      <Row>
        <Col>
          <QuestionCard
            question={question}
            qidx={idx}
            isSelected={isSelected}
            isNa={isNa}
            turnSelected={turnSelected}
            turnSelectedNa={turnSelectedNa}
            answer={answer}
            showResult={showResult}
          />
        </Col>
      </Row>
      {unenteredError && <UnenteredErrorAlert setUnenteredError={setUnenteredError}/>}
      {showResult && <ValidationResult correct={isSelected.every((sel, idx) => answer.isSelected[idx].includes(sel))}
                                       desc={answer.desc} setShowResult={setShowResult}/>}
      <Row className="mb-4">
        <Col>
          <Button
            onClick={() => validate()}
            variant="info"
            className="my-2 d-flex mx-auto px-3"
          >
            答えを見る
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default React.memo(Question);
