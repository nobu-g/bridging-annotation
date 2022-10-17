import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {useHistory} from 'react-router-dom';
import path from 'path';

export const TransitionButtons = ({taskNum}) => {
  const history = useHistory();
  let dirs = window.location.pathname.split('/');
  const currentIndex = parseInt(dirs.pop());
  const basePath = path.relative(process.env.NODE_ENV === 'development' ? '' : process.env.PUBLIC_URL, dirs.join('/'))
  return (
    <Row>
      <Col className="col-2 text-left">
        {
          parseInt(taskNum) > 0 &&
          <Button
            onClick={() => history.push(`/${basePath}/${(currentIndex - 1)}`)}
            variant="info"
            className="my-2 d-flex mx-auto"
          >
            前へ
          </Button>
        }
      </Col>
      <Col className="col-2 offset-8 text-right">
        <Button
          onClick={() => history.push(`/${basePath}/${(currentIndex + 1)}`)}
          variant="info"
          className="my-2 d-flex mx-auto"
        >
          次へ
        </Button>
      </Col>
    </Row>
  );
};

export default TransitionButtons;
