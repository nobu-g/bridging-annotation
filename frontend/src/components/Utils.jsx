import React from 'react';
import Alert from 'react-bootstrap/Alert';

export const apiUrl = process.env.REACT_APP_API_URL || (process.env.PUBLIC_URL + '/../backend/');

export const fetchWithErrorHandling = async (url, options) => {
  return await fetch(url, options)
    .then(res => {
      if (res.ok) {
        return res;
      }
      throw Error(res.status + ' ' + res.statusText)
    })
    .then(res => {
      return res.json()
    })
    .catch(err => {
      throw Error(err);
    });
};

export const ErrorAlert = ({message}) => {
  return (
    <Alert variant='danger' className="mt-3">
      <Alert.Heading>{'エラーが発生しました'}</Alert.Heading>
      <p>
        {message}
      </p>
    </Alert>
  );
};

export const assert = (actual, expected) => {
  console.assert(actual === expected, '\nactual: ' + actual + '\nexpected: ' + expected);
};
