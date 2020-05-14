import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps, Link } from '@reach/router';

const Container = styled.div`
  max-width: 648px;
  margin: 0 auto;
  padding: 24px;
`;

const About = (props: RouteComponentProps) => {
  const { t } = useTranslation(['aboutPage']);
  return (
    <Container>
      <Trans i18nKey="aboutPage:content" t={t}>
        <h1>Oiretutka kerää tietoa koronaviruksesta</h1>
        <p>
          Oiretutka on Helsingin Sanomien ja teknologiayhtiö Futuricen kehittämä hanke, jonka tarkoituksena on kerätä
          suomalaisilta tietoja heidän kokemistaan oireista ja kertoa niistä lukijoille. Myös muita suomalaisia medioita
          osallistuu tiedonkeruuseen. Tiedon avulla on tarkoitus ymmärtää paremmin, miten koronavirus mahdollisesti
          leviää Suomessa. Hanke tehdään avoimen lähdekoodin periaatteella.{' '}
          <a href="https://github.com/futurice/symptomradar">Sivuston lähdekoodi löytyy täältä.</a>
        </p>
        <p>
          Tiedot ovat kerätty kyselylomakkeen avulla. Tällä sivustolla näytämme kyselyn tuloksia.{' '}
          <Link to="../tietosuojalauseke">Lue lisää tietosuojasta täältä.</Link>
        </p>
      </Trans>
    </Container>
  );
};

export default About;
