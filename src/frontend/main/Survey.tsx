import React, { useEffect } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';

// IMPORANT: We can't import the WHOLE library, just the "parent page" part!
// Including the "child page" part in our bundle is enough to activate it when the standalone site is framed,
// potentially causing an infinite resizing loop within the library. That is, before changing this import,
// BE VERY SURE you have tested both framing the standalone site, and the standalone site's capability to frame the embed site.
import * as iframeResizer from 'iframe-resizer/js/iframeResizer';

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
    iframeResizer({ log: false }, '#formIframe');
  });

  return (
    <Container>
      <Iframe id="formIframe" title="Oiretutka-kysely" src="/embed/v1/?variant=plain" />
    </Container>
  );
};

export default Survey;
