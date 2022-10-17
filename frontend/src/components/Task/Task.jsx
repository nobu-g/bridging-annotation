import React, {useEffect, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import {useQuery} from 'react-query';

import Description from '../Description/Description';
import Question from './Question';
import Submit from './Submit';
import {apiUrl, ErrorAlert} from '../Utils';
import {SPECIALS} from '../Question/QuestionCard';

export const reducer = (state, action) => {
  switch (action.type) {
    case 'InitializeSelected': {
      return {
        ...state,
        isSelectedAll: action.value
      };
    }
    case 'initializeNa': {
      return {
        ...state,
        isNa: action.value
      };
    }
    case 'setIsSelected': {
      const newValues = {...state.isSelectedAll};
      newValues[action.qid] = action.value(newValues[action.qid]);
      return {
        ...state,
        isSelectedAll: newValues
      };
    }
    case 'setIsNa': {
      const newValues = {...state.isNa};
      newValues[action.qid] = action.value(newValues[action.qid]);
      return {
        ...state,
        isNa: newValues
      };
    }
  }
};

const Task = () => {
  const {jobId, taskNum} = useParams();
  const [{isSelectedAll, isNa}, dispatch] = useReducer(reducer, {
    isSelectedAll: {},
    isNa: {},
  });

  const {data, isLoading, isError, error} = useQuery(
    'tasks',
    async () => await fetch(`${apiUrl}task/${jobId}/${taskNum}`)
      .then(res => {
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

  const {questions} = data;
  const listUnentered = () => {
    let qidxs = [];
    questions.forEach(({qid}, qidx) => {
      if (isSelectedAll[qid].every(sel => sel < 2) && isNa[qid] === false) {
        qidxs.push(qidx);
      }
    })
    return qidxs;
  };

  return (
    <Container fluid="lg">
      <h1 className="my-3">タスク説明（再掲）</h1>
      <Description opened={false}/>
      <h1 className="my-3">問題</h1>
      <Container fluid="lg">
        {
          questions.map((question, idx) =>
            <div className="mt-4" key={question.qid}>
              {
                (idx === 0 || question.did !== questions[idx - 1].did) &&
                <span>
                  <b>原文：</b>{question.phrases.map(p => p.text).join('')}
                </span>
              }
              <Question
                question={question}
                isSelected={isSelectedAll[question.qid]}
                isNa={isNa[question.qid]}
                dispatch={dispatch}
                idx={idx}
                jobId={jobId}
              />
            </div>
          )
        }
        <Submit jobId={jobId} isSelectedAll={isSelectedAll} taskNum={taskNum} listUnentered={listUnentered}/>
      </Container>
    </Container>
  );
};

export default Task;
