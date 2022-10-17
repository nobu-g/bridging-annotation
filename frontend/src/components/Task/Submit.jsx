import React, {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from "react-bootstrap/Alert";
import {useHistory} from 'react-router-dom';

import {apiUrl, ErrorAlert, fetchWithErrorHandling} from '../Utils';

// random id of 16 digits
const taskId = [Math.random(), Math.random()].map(x => Math.floor(x * (16 ** 8)).toString(16).padStart(8, '0')).join('');


const UnenteredErrorAlert = ({qidxs, setUnentered}) => {
  return (
    <Alert variant='danger' onClose={() => setUnentered([])} dismissible>
      <Alert.Heading>{'未入力の項目があります：'}</Alert.Heading>
      <p>
        {qidxs.map(qidx => <span className="mx-1" key={qidx}>問題{qidx + 1}</span>)}
      </p>
    </Alert>
  );
};

const Submit = ({jobId, isSelectedAll, taskNum, listUnentered}) => {
  const [error, setError] = useState(null);
  const [unentered, setUnentered] = useState([]);
  const history = useHistory();

  const submit = (jsonData) => {
    const list = listUnentered()
    setUnentered(list)
    if (list.length > 0) {
      return;
    }
    fetchWithErrorHandling(`${apiUrl}submit/${jobId}/${taskNum}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(jsonData)
    }).then(() => {
      console.log('sent successfully:');
      console.log(jsonData);
      setError(null);
      history.push(`/result?taskId=${taskId}`);
    }).catch(err => {
      setError(err);
      console.log(jsonData);
    });
  };

  return (
    <>
      {error && <ErrorAlert message={error.message}/>}
      {unentered.length > 0 && <UnenteredErrorAlert qidxs={unentered} setUnentered={setUnentered}/>}
      <Row>
        <Col>
          <Button
            onClick={() => {
              submit({
                'taskId': taskId,
                'questions': Object.keys(isSelectedAll).map(qid => ({'qid': qid, 'isSelected': isSelectedAll[qid]}))
              })
            }}
            type="submit"
            variant="info"
            size="lg"
            className="my-2 px-5 py-2 d-flex mx-auto"
          >
            送信
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Submit;
