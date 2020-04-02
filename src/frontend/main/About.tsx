import React, { useEffect } from 'react';
import styled from 'styled-components';
import { RouteComponentProps, Link } from '@reach/router';
import * as resizer from 'iframe-resizer';

const Container = styled.div`
  max-width: 768px;
  margin: 24px auto;
`;

const AboutContent = styled.div`
  padding: 24px 24px 0;
`;

const Iframe = styled.iframe`
  border: none;
  width: 100px;
  min-width: 100%;
`;

const About = (props: RouteComponentProps) => {
  useEffect(() => {
    resizer.iframeResizer({ log: false }, '#formIframe');
  });

  return (
    <Container>
      <AboutContent>
        <p>
          Oiretutka on Helsingin Sanomien ja teknologiayhtiö Futuricen kehittämä hanke, jonka tarkoituksena on kerätä
          suomalaisilta tietoja heidän kokemistaan oireista. Myös muita suomalaisia medioita osallistuu tiedonkeruuseen.
          Tiedon avulla on tarkoitus ymmärtää paremmin, miten koronavirus mahdollisesti leviää Suomessa. Hanke tehdään
          avoimen lähdekoodin periaatteella.
        </p>
        <p>
          Tiedot ovat kerätty kyselylomakkeen avulla. Tällä sivustolla näytämme kyselyn tuloksia.{' '}
          <Link to="../tietosuojalauseke">Lue lisää tietosuojasta täältä.</Link>
        </p>
      </AboutContent>
      <Iframe id="formIframe" title="Oiretutka-kysely" src="/embed/v1/?variant=plain" />
    </Container>
  );
};

export default About;
