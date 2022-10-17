import React from 'react';
import Container from 'react-bootstrap/Container';

import QuestionCard from '../QuestionView/QuestionCard';
import numSelected from './data/results.json';
import questions from './data/questions.json';

const Example = () => {
  return (
    <Container>
      <h1 className="my-3">結果</h1>
      <Container>
        {
          questions.map((question, idx) =>
            <React.Fragment key={question.qid}>
              <QuestionCard
                question={question}
                result={numSelected[idx]}
                idx={idx}
                key={idx}
              />
            </React.Fragment>
          )
        }
      </Container>
    </Container>
  );
};

export default Example;
