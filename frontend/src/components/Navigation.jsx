import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const Navigation = () => {
  return (
    <Navbar bg="info" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>
          <span>クラウドソーシング 回答ページ</span>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Navigation;
