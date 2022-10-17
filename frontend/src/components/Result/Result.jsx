import React from 'react';
import Container from 'react-bootstrap/Container';
import {useLocation} from 'react-router-dom';

const Result = () => {
  const search = useLocation().search;
  const query = new URLSearchParams(search);

  return (
    <Container>
      <div className="my-5">
        <p className="text-center display-4 text-info">
          提出が完了しました
        </p>
        <p className="text-center text-secondary" style={{fontSize: '1.5rem'}}>
          Yahoo!クラウドソーシングの画面に戻り、次のタスクIDをテキストボックスにコピーしてください <br/>
          タスクID: {query.get('taskId')}
        </p>
      </div>
    </Container>
  );
};

export default Result;
