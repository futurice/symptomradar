import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, Link } from '@reach/router';
import IframeResizer from 'iframe-resizer-react';

const Container = styled.div`
  margin: 24px;
`;

const Iframe = styled(IframeResizer)`
  border: none;
  min-width: 100%;
  width: 100px;
`;

const About = (props: RouteComponentProps) => {
  return (
    <Container>
      <p>About</p>
      <Link to="../tietosuojalauseke">Tietosuoja</Link>
      {/* Settings used at HS 
      <Iframe
        id="autoresize45905"
        className="autoresize"
        // allowfullscreen="true"
        // allowvr="true"
        src="https://www.oiretutka.fi/embed/v1/"
        width="100%"
        height=""
        scrolling="no"
        frameBorder="0"
        style={{ border: 'none', width: '100px', minWidth: '100%' }}
      ></Iframe> */}
      <Iframe log src="https://www.oiretutka.fi/embed/v1/" style={{ width: '1px', minWidth: '100%' }} />
    </Container>
  );
};

export default About;
