import React, { useEffect } from 'react';
import styled from 'styled-components';
import { RouteComponentProps, Link } from '@reach/router';
import * as resizer from 'iframe-resizer';

const Container = styled.div`
  margin: 24px;
`;

const About = (props: RouteComponentProps) => {
  useEffect(() => {
    resizer.iframeResizer({ log: true }, '#formIframe');
  });

  return (
    <Container>
      <p>About</p>
      <Link to="../tietosuojalauseke">Tietosuoja</Link>
      <iframe
        id="formIframe"
        src="https://www.oiretutka.fi/embed/v1/"
        style={{ border: 'none', width: '100px', minWidth: '100%' }}
      />
    </Container>
  );
};

export default About;
