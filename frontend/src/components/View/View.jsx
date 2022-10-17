import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import QuestionCard from '../QuestionView/QuestionCard';
import TransitionButtons from './TransitionButton';
import {apiUrl, ErrorAlert, fetchWithErrorHandling} from '../Utils';

const View = () => {
  const {mode, jobId, taskNum} = useParams();
  const [questions, setQuestions] = useState([]);
  const [numSelected, setNumSelected] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWithErrorHandling(`${apiUrl}task/${jobId}/${taskNum}`)
      .then(config => {
        setQuestions(config['questions']);
        setError(null);
      })
      .catch(err => {
        setError(err);
      });
    fetchWithErrorHandling(`${apiUrl}result/${mode}/${jobId}/${taskNum}`)
      .then(results => {
        setNumSelected(results);
        setError(null);
      })
      .catch(err => {
        setError(err);
      });
  }, [mode, jobId, taskNum]);

  useEffect(() => {
    if (error) {
      return;
    }
    setQuestions([]);
    setNumSelected([]);
  }, [mode, jobId, taskNum]);

  if (error) {
    return (
      <Container>
        <ErrorAlert message={error.message}/>
      </Container>
    );
  }

  if (questions.length === 0 || numSelected.length === 0) {
    return (
      <>
      </>
    );
  }

  return (
    <Container>
      <h1 className="my-3">結果</h1>
      <Container>
        {
          questions.map((question, idx) =>
            <React.Fragment key={question.qid}>
              {
                (idx === 0 || question.did !== questions[idx - 1].did) &&
                <span>
                  <b>原文：</b>{question.phrases.map(p => p.text).join('')}
                </span>
              }
              <QuestionCard
                question={question}
                result={numSelected[idx]}
                idx={idx}
                key={idx}
              />
            </React.Fragment>
          )
        }
        <TransitionButtons taskNum={taskNum}/>
      </Container>
    </Container>
  );
};

export default View;
