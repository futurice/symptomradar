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

    @media (min-width: 500px) {
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
      {formattedData.responsesTotal != null ? (
        <>
          <H3>
            Vastauksia yhteensä: {formattedData.responsesTotal} ({formattedData.percentageOfPopulation} % väkiluvusta)
          </H3>
          <Description>Verrattuna kunnan väkilukuun</Description>
        </>
      ) : (
        <p>Alle 25 vastausta</p>
      )}
      {formattedData.responsesTotal != null && (
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
              <tr>
                <td>{formattedData.musclePainTotal}</td>
                <td>{formattedData.musclePainPercentage} %</td>
                <th scope="row">Lihaskipuja</th>
              </tr>
              <tr>
                <td>{formattedData.headacheTotal}</td>
                <td>{formattedData.headachePercentage} %</td>
                <th scope="row">Päänsärkyä</th>
              </tr>
              <tr>
                <td>{formattedData.soreThroatTotal}</td>
                <td>{formattedData.soreThroatPercentage} %</td>
                <th scope="row">Kurkkukipua</th>
              </tr>
              <tr>
                <td>{formattedData.rhinitisTotal}</td>
                <td>{formattedData.rhinitisPercentage} %</td>
                <th scope="row">Nuhaa</th>
              </tr>
              <tr>
                <td>{formattedData.stomachIssuesTotal}</td>
                <td>{formattedData.stomachIssuesPercentage} %</td>
                <th scope="row">Vatsaoireita</th>
              </tr>
              <tr>
                <td>{formattedData.sensoryIssuesTotal}</td>
                <td>{formattedData.sensoryIssuesPercentage} %</td>
                <th scope="row">Hajuaistin tai makuaistin heikkenemistä</th>
              </tr>
            </tbody>
          </table>
        </Symptoms>
      )}
      <CloseButton type="button" data-dismiss="modal" aria-label="Sulje" label="Sulje" handleClick={hide} />
    </>
  );
};

export default ModalContent;
