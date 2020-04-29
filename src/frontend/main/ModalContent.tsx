import React from 'react';
import styled from 'styled-components';
import PrimaryButton from './PrimaryButton';
import handleResponseData from './handleResponseData';

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
  const formattedData = handleResponseData(content);

  return (
    <>
      <ModalHeader>
        <H2>{content.city}</H2>
      </ModalHeader>
      <H3>
        Vastauksia yhteensä: {formattedData.responsesTotal}{' '}
        {formattedData.percentageOfPopulation != null
          ? `(${formattedData.percentageOfPopulation} % väkiluvusta)`
          : null}
      </H3>
      <Description>{formattedData.responsesTotal !== '< 25' ? 'Verrattuna kunnan väkilukuun' : null}</Description>
      <Symptoms>
        <table>
          <tbody>
            <tr>
              <td>{formattedData.suspicionTotal}</td>
              {formattedData.suspicionPercentage != null ? <td>{formattedData.suspicionPercentage} %</td> : null}
              <th scope="row">Epäilys koronavirus&shy;tartunnasta</th>
            </tr>
            <tr>
              <td>{formattedData.coughTotal}</td>
              {formattedData.coughPercentage != null ? <td>{formattedData.coughPercentage} %</td> : null}
              <th scope="row">Yskää</th>
            </tr>
            <tr>
              <td>{formattedData.feverTotal}</td>
              {formattedData.feverPercentage != null ? <td>{formattedData.feverPercentage} %</td> : null}
              <th scope="row">Kuumetta</th>
            </tr>
            <tr>
              <td>{formattedData.breathingDifficultiesTotal}</td>
              {formattedData.breathingDifficultiesPercentage != null ? (
                <td>{formattedData.breathingDifficultiesPercentage} %</td>
              ) : null}
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
