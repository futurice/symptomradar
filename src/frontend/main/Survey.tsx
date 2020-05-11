import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import i18n from 'i18next';
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
  const [iframeSrc, setIframeSrc] = useState('/embed/v1/?variant=plain');
  const currentLanguage = i18n.language;
  useEffect(() => {
    iframeResizer({ log: false }, '#formIframe');
  });

  useEffect(() => {
    const newUrl = currentLanguage === 'en' ? '/embed/v1/index.en.html?variant=plain' : '/embed/v1/?variant=plain';
    setIframeSrc(newUrl);
  }, [currentLanguage]);

  return (
    <Container>
      <Iframe id="formIframe" title="Oiretutka-kysely" src={iframeSrc} />
    </Container>
  );
};

export default Survey;
