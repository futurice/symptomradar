import React from 'react';
import styled from 'styled-components';

/* Placeholder. Edit, rename or replace as necessary. */

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
`;

const Symptoms = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 4px 8px;
  padding-left: 16px;

  p {
    margin: 0;
  }
`;

const ModalContent = ({ content }: ModalContentProps) => {
  const responsesTotal = content.properties.responses.toLocaleString('fi-FI');
  const suspicionTotal = content.properties.corona_suspicion_yes.toLocaleString('fi-FI');
  const coughTotal = (content.properties.cough_mild + content.properties.cough_intense).toLocaleString('fi-FI');
  const feverTotal = (content.properties.fever_slight + content.properties.fever_high).toLocaleString('fi-FI');
  return (
    <>
      <ModalHeader>
        <H2>{content.properties.City}</H2>
      </ModalHeader>
      <H3>Vastauksia yhteensä {responsesTotal}:</H3>
      <Symptoms>
        <span>
          {suspicionTotal} (
          {((content.properties.corona_suspicion_yes * 100) / content.properties.responses).toFixed(1)}%)
        </span>
        <p>Epäilys koronavirustartunnasta </p>
        <span>
          {coughTotal} (
          {(
            ((content.properties.cough_mild + content.properties.cough_intense) * 100) /
            content.properties.responses
          ).toFixed(1)}
          %)
        </span>
        <p>Yskää</p>
        <span>
          {feverTotal} (
          {(
            ((content.properties.fever_slight + content.properties.fever_high) * 100) /
            content.properties.responses
          ).toFixed(1)}
          %)
        </span>
        <p>Kuumetta</p>
      </Symptoms>
    </>
  );
};

export default ModalContent;
