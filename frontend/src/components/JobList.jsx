import React, {useEffect, useState} from 'react';
import {Container, ListGroup} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import path from 'path';

import {apiUrl, ErrorAlert, fetchWithErrorHandling} from './Utils';

const JobList = () => {
  const [jobList, setJobList] = useState([]);
  const [error, setError] = useState(null);
  const basePath = process.env.NODE_ENV === 'development' ? '' : process.env.PUBLIC_URL;
  const relativePath = '/' + path.relative(basePath, window.location.pathname);

  console.log(basePath); console.log(relativePath);
  useEffect(() => {
    fetchWithErrorHandling(`${apiUrl}list`)
      .then(data => {
        setJobList(data);
        setError(null);
      })
      .catch(err => {
        setError(err);
      });
  }, [setJobList]);

  if (error) {
    return (
      <Container>
        <ErrorAlert message={error.message}/>
      </Container>
    );
  }

  return (
    <Container>
      <ListGroup className="my-3">
      {
        jobList.map((jobName, idx) =>
          <ListGroup.Item key={idx}>
            <Link to={`${relativePath}/${jobName}`}>{jobName}</Link>
          </ListGroup.Item>
        )
      }
      </ListGroup>
    </Container>
  );
};

export default JobList;
