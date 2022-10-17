import React from 'react';
import Container from 'react-bootstrap/Container';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from 'react-query';

import Navigation from './components/Navigation';
import Task from './components/Task/Task';
import View from './components/View/View';
import Predict from './components/Predict/Predict';
import JobList from './components/JobList'
import Result from './components/Result/Result';
import Tutorial from './components/Tutorial/Tutorial';
import Footer from './components/Footer';
import Example from './components/Example/Example';
import {ErrorAlert} from './components/Utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 300000,
    },
  },
});

const App = () => {
  console.log(window.location);
  console.log(process.env);

  return (
    <>
      <Navigation/>
      <Router basename={process.env.NODE_ENV === 'development' ? '' : process.env.PUBLIC_URL}>
        <Switch>
          <Route exact path="/">root</Route>
          <Route exact path="/result"><Result/></Route>
          <Route exact path="/task"><JobList/></Route>
          <Redirect exact from="/tutorial/:jobId" to="/tutorial/:jobId/0"/>
          <Route exact path="/tutorial/:jobId/:taskNum(\d+)">
            <QueryClientProvider client={queryClient}>
              <Tutorial/>
            </QueryClientProvider>
          </Route>
          <Redirect exact from="/task/:jobId" to="/task/:jobId/0"/>
          <Route exact path="/task/:jobId/:taskNum(\d+)">
            <QueryClientProvider client={queryClient}>
              <Task/>
            </QueryClientProvider>
          </Route>
          <Redirect exact from="/view" to="/view/both"/>
          <Route exact path="/view/:mode"><JobList/></Route>
          <Redirect exact from="/view/:mode/:jobId" to="/view/:mode/:jobId/0"/>
          <Route exact path="/view/:mode/:jobId/:taskNum(\d+)"><View/></Route>
          <Route exact path="/predict/:expr/:runId/:evalSet(valid|test)/:corpus(crowd|kwdlc|kc|fuman)/:taskNum(\d+)">
            <Predict/>
          </Route>
          <Route exact path="/example"><Example/></Route>
          <Route>
            <Container>
              <ErrorAlert message="Not Matched"/>
            </Container>
          </Route>
        </Switch>
      </Router>
      <Footer/>
    </>
  );
};

export default App;
