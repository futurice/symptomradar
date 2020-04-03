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
  margin: 8px 0 24px 0;
`;

const ModalContent = ({ content }: ModalContentProps) => {
  console.log(content);
  return (
    <>
      <ModalHeader>
        <H2>{content.properties.City}</H2>
      </ModalHeader>
      <p>Vastauksia yhteensä {content.properties.responses}</p>
      <p>Yskää</p>
      <p>Kuumetta</p>
    </>
  );
};

export default ModalContent;
