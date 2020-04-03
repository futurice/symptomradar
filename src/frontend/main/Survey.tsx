import React, { useEffect } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import * as resizer from 'iframe-resizer';

const Container = styled.div`
  max-width: 632px;
  margin: 24px auto 0;
`;

const Iframe = styled.iframe`
  border: none;
  width: 100px;
  min-width: 100%;
`;

const Survey = (props: RouteComponentProps) => {
  useEffect(() => {
    resizer.iframeResizer({ log: false }, '#formIframe');
  });

  return (
    <Container>
      <Iframe id="formIframe" title="Oiretutka-kysely" src="/embed/v1/?variant=plain" />
    </Container>
  );
};

export default Survey;
