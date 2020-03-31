import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';

const Container = styled.div`
  margin: 24px;
`;

const About = (props: RouteComponentProps) => {
  return (
    <Container>
      <p>About</p>
    </Container>
  );
};

export default About;
