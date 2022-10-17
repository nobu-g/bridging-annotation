import React from 'react';
import Container from 'react-bootstrap/Container';

const Footer = () => {
  return (
    <footer className="text-center my-5">
      <Container>
        <hr />
        <span className="text-muted">{`Copyright ${new Date().getFullYear()} Kurohashi-Chu-Murawaki Lab.`}</span>
      </Container>
    </footer>
  );
};

export default Footer;
