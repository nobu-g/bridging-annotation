import React, {useEffect, useReducer} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import {useHistory, useParams} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import {useQuery} from 'react-query';

import Description from '../Description/Description';
import Question from './Question';
import {SPECIALS} from '../Question/QuestionCard';
import {reducer} from '../Task/Task';
import {apiUrl, ErrorAlert} from '../Utils';

const Tutorial = () => {
  const {jobId, taskNum} = useParams();
  const history = useHistory();
  const [{isSelectedAll, isNa}, dispatch] = useReducer(reducer, {
    isSelectedAll: {},
    isNa: {},
  });

  const {data, isLoading, isError, error} = useQuery(
    'tutorials',
    async () => await fetch(`${apiUrl}tutorial/${jobId}/${taskNum}`)
      .then(res => {
        console.log('fetched tutorial');
        if (res.ok) {
          return res.json();
        }
        throw Error(res.status + ' ' + res.statusText);
      })
      .catch(err => {
        throw Error(err);
      }),
  );

  useEffect(() => {
    if (Object.keys(isSelectedAll).length > 0 && Object.keys(isNa).length > 0) {
      return;
    }
    if (isLoading || isError) {
      return;
    }
    let initIsSelectedAll = {};
    let initIsNa = {};
    data.questions.forEach(({qid, phrases}) => {
      initIsSelectedAll[qid] = Array(phrases.length + SPECIALS.length).fill(0);
      initIsNa[qid] = false;
    });
    dispatch({type: 'InitializeSelected', value: initIsSelectedAll});
    dispatch({type: 'initializeNa', value: initIsNa});
  }, [data, isLoading, isError, isNa, isSelectedAll])

  if (isError) {
    return (
      <Container>
        <ErrorAlert message={error.message}/>
      </Container>
    );
  }
  if (isLoading || Object.keys(isSelectedAll).length === 0 || isNa.length === 0) {
    return <></>;
  }

  const {questions, answers} = data;
  const haveFinishedTutorial = () => {
    return questions.map((question, idx) =>
      (isSelectedAll[question.qid].every((sel, i) => answers[idx].isSelected[i].includes(sel))) &&
      (isSelectedAll[question.qid].some(sel => sel === 2) || isNa[question.qid] === true)
    ).every(v => v);
  };
  return (
    <Container fluid="lg">
      <h1 className="my-3">???????????????</h1>
      <Description opened={true}/>
      <h1 className="my-3">????????????</h1>
      <Container fluid="lg">
      <span>
        ????????????????????????????????????????????????3???????????????????????????
        ?????????????????????????????????????????????3????????????????????????????????????????????????????????????????????????????????????
      </span><br/>
        {
          questions.map((question, idx) =>
            <Question
              question={question}
              answer={answers[idx]}
              isSelected={isSelectedAll[question.qid]}
              isNa={isNa[question.qid]}
              dispatch={dispatch}
              idx={idx}
              jobId={jobId}
              key={question.qid}
            />
          )
        }
      </Container>
      <Row>
        <Col>
          <Button
            onClick={() => history.push(`/task/${jobId}/${taskNum}`)}
            type="submit"
            variant="info"
            size="lg"
            className="my-2 px-5 py-2 d-flex mx-auto"
            disabled={haveFinishedTutorial() === false}
          >
            ??????????????????
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Tutorial;
