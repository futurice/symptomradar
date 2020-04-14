import React from 'react';
import styled from 'styled-components';

type ModalContentProps = {
  content: any;
};

const ModalHeader = styled.div`
  position: relative;
`;

const H2 = styled.h2`
  font-size: 21px;
  margin: 0 0 24px 0;
`;

const H3 = styled.h3`
  font-weight: bold;
  margin-bottom: 0;
`;

const P = styled.p`
  font-style: italic;
  font-size: 16px;
  margin-top: 0;
`;

const Symptoms = styled.div`
  display: grid;
  grid-template-columns: auto 50px 1fr;
  grid-gap: 4px 5px;
  p {
    margin: 0;
  }

  @media (min-width: 350px) {
    grid-gap: 4px 20px;
  }
`;

const ModalContent = ({ content }: ModalContentProps) => {
  const responsesTotal =
    content.properties.responses !== -1 ? content.properties.responses.toLocaleString('fi-FI') : '< 25';
  const suspicionTotal =
    content.properties.corona_suspicion_yes !== -1
      ? content.properties.corona_suspicion_yes.toLocaleString('fi-FI')
      : 'ei tietoa';
  const coughTotal =
    content.properties.cough_mild + content.properties.cough_intense !== -2
      ? (content.properties.cough_mild + content.properties.cough_intense).toLocaleString('fi-FI')
      : 'ei tietoa';
  const feverTotal =
    content.properties.fever_slight + content.properties.fever_high !== -2
      ? (content.properties.fever_slight + content.properties.fever_high).toLocaleString('fi-FI')
      : 'ei tietoa';
  const breathingDifficulties =
    content.properties.breathing_difficulties_yes !== -1
      ? content.properties.breathing_difficulties_yes.toLocaleString('fi-FI')
      : 'ei tietoa';
  return (
    <>
      <ModalHeader>
        <H2>{content.properties.city}</H2>
      </ModalHeader>
      <H3>
        Vastauksia yhteensä: {responsesTotal}{' '}
        {responsesTotal !== '< 25'
          ? `(${((content.properties.responses * 100) / content.properties.population)
              .toFixed(2)
              .replace('.', ',')} % väkiluvusta)`
          : null}
      </H3>
      <P>{responsesTotal !== '< 25' ? 'Verrattuna kunnan väkilukuun' : null}</P>
      <Symptoms>
        <span>{suspicionTotal}</span>
        <span>
          {content.properties.corona_suspicion_yes !== -1
            ? `${((content.properties.corona_suspicion_yes * 100) / content.properties.population)
                .toFixed(2)
                .replace('.', ',')} %`
            : null}
        </span>
        <p>Epäilys koronavirustartunnasta </p>
        <span>{coughTotal}</span>
        <span>
          {content.properties.cough_mild + content.properties.cough_intense !== -2
            ? `${(
                ((content.properties.cough_mild + content.properties.cough_intense) * 100) /
                content.properties.population
              )
                .toFixed(2)
                .replace('.', ',')} %`
            : null}
        </span>
        <p>Yskää</p>
        <span>{feverTotal}</span>
        <span>
          {content.properties.fever_slight + content.properties.fever_high !== -2
            ? `${(
                ((content.properties.fever_slight + content.properties.fever_high) * 100) /
                content.properties.population
              )
                .toFixed(2)
                .replace('.', ',')} %`
            : null}
        </span>
        <p>Kuumetta</p>
        <span>{breathingDifficulties}</span>
        <span>
          {content.properties.breathing_difficulties_yes !== -1
            ? `${((content.properties.breathing_difficulties_yes * 100) / content.properties.population)
                .toFixed(2)
                .replace('.', ',')} %`
            : null}
        </span>
        <p>Vaikeuksia hengittää</p>
      </Symptoms>
    </>
  );
};

export default ModalContent;
