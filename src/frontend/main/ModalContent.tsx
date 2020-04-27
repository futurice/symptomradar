import React from 'react';
import styled from 'styled-components';
import PrimaryButton from './PrimaryButton';
import ResponseDataHandler from './ResponseDataHandler';

type ModalContentProps = {
  content: any;
  hide: () => void;
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

const Description = styled.p`
  font-style: italic;
  margin-top: 0;
`;

const Symptoms = styled.div`
  td {
    padding-right: 10px;

    &:nth-child(2) {
      min-width: 60px;
    }

    @media (min-width: 450px) {
      padding-right: 20px;
    }
  }

  th {
    font-weight: normal;
    text-align: left;
    hyphens: manual;
  }
`;

const CloseButton = styled(PrimaryButton)`
  display: block;
  margin: 40px auto 0 auto;
  min-width: 135px;
`;

const ModalContent = ({ content, hide }: ModalContentProps) => {
  const formattedData = ResponseDataHandler(content);

  return (
    <>
      <ModalHeader>
        <H2>{content.city}</H2>
      </ModalHeader>
      <H3>
        Vastauksia yhteensä: {formattedData.responsesTotal} ({formattedData.percentageOfPopulation} % väkiluvusta)
      </H3>
      <Description>{formattedData.responsesTotal !== '< 25' ? 'Verrattuna kunnan väkilukuun' : null}</Description>
      <Symptoms>
        <table>
          <tbody>
            <tr>
              <td>{formattedData.suspicionTotal}</td>
              <td>{formattedData.suspicionPercentage} %</td>
              <th scope="row">Epäilys koronavirus&shy;tartunnasta</th>
            </tr>
            <tr>
              <td>{formattedData.coughTotal}</td>
              <td>{formattedData.coughPercentage} %</td>
              <th scope="row">Yskää</th>
            </tr>
            <tr>
              <td>{formattedData.feverTotal}</td>
              <td>{formattedData.feverPercentage} %</td>
              <th scope="row">Kuumetta</th>
            </tr>
            <tr>
              <td>{formattedData.breathingDifficultiesTotal}</td>
              <td>{formattedData.breathingDifficultiesPercentage} %</td>
              <th scope="row">Vaikeuksia hengittää</th>
            </tr>
          </tbody>
        </table>
      </Symptoms>
      <CloseButton type="button" data-dismiss="modal" aria-label="Sulje" label="Sulje" handleClick={hide} />
    </>
  );
};

export default ModalContent;
