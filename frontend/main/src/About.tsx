import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, Link } from '@reach/router';

const Container = styled.div`
  margin: 24px;
`;

const About = (props: RouteComponentProps) => {
  return (
    <Container>
      <p>About</p>
      <Link to="../tietosuojalauseke">Tietosuoja</Link>
    </Container>
  );
};

export default About;
