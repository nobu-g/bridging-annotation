import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import TransitionButtons from '../View/TransitionButton';
import {apiUrl, ErrorAlert, fetchWithErrorHandling} from '../Utils';
import QuestionCard from '../QuestionView/QuestionCard';

const Predict = () => {
  const {expr, runId, evalSet, corpus, taskNum} = useParams();
  const [questions, setQuestions] = useState([]);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWithErrorHandling(`${apiUrl}predict/${expr}/${runId}/${evalSet}/${corpus}/${taskNum}`)
      .then(results => {
        setQuestions(results.map(r => r['question']))
        setData(results);
        setError(null);
      })
      .catch(err => {
        setError(err);
      });
  }, [expr, runId, evalSet, corpus, taskNum]);

  if (error) {
    return (
      <Container>
        <ErrorAlert message={error.message}/>
      </Container>
    );
  }

  if (questions.length === 0 || data.length === 0 || questions.length !== data.length) {
    return (
      <>
      </>
    );
  }

  return (
    <Container fluid={true}>
      <h1 className="my-3">結果</h1>
      <Container fluid={true}>
        {
          questions.map((question, idx) =>
            <React.Fragment key={question.qid}>
              {
                (idx === 0 || question.did !== questions[idx - 1].did) &&
                <Row key={-idx} className="mt-4">
                  <Col>
                    <span>
                      <b>原文：</b>{question.phrases.map(p => p.text).join('')}
                    </span>
                  </Col>
                </Row>
              }
              <Row key={idx} className="mt-4">
                <Col>
                  <span><b>GOLD</b> (collected from crowd workers)</span>
                  <QuestionCard
                    question={question}
                    result={{
                      ...data[idx],
                      votes: data[idx]['goldVotes'].map(v => v * 16),
                      naVotes: data[idx]['goldNaVotes'] * 16,
                      qid: question.qid
                    }}
                    idx={idx}
                    key={idx}
                  />
                </Col>
                <Col>
                  <span><b>SYSTEM</b> (predicted by system)</span>
                  <QuestionCard
                    question={question}
                    result={{
                      ...data[idx],
                      votes: data[idx]['votes'].map(v => v * 16),
                      naVotes: data[idx]['naVotes'] * 16,
                      goldArguments: {},
                      goldExophors: {},
                      qid: question.qid
                    }}
                    idx={idx}
                    key={idx}
                  />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
        <TransitionButtons taskNum={taskNum}/>
      </Container>
    </Container>
  );
};

export default Predict;
