import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import { symptomLabels } from './constants';
import handleResponseData, { ResponseDataKey } from './handleResponseData';

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
  const { t } = useTranslation(['main']);

  return (
    <>
      <ModalHeader>
        <H2>{content.city}</H2>
      </ModalHeader>
      {formattedData.responsesTotal != null ? (
        <>
          <H3>
            {t('main:totalResponsesModalInfoText', {
              total: formattedData.responsesTotal,
              percentage: formattedData.percentageOfPopulation,
            })}
          </H3>
          <Description>{t('main:comparedToMunicipalityPopulation')}</Description>
        </>
      ) : (
        <p>Alueelta ei ole vielä tarpeeksi vastauksia</p>
      )}
      {formattedData.responsesTotal != null && (
        <Symptoms>
          <table>
            <tbody>
              {(Object.keys(symptomLabels) as Array<keyof typeof symptomLabels>).map(key => {
                const totalKey = `${key}Total` as ResponseDataKey;
                const percentageKey = `${key}Percentage` as ResponseDataKey;
                return (
                  <tr key={`symptom-row-${key}`}>
                    <th scope="row">{t(`symptomLabels:${symptomLabels[key]}`)}</th>
                    <td>{formattedData[totalKey]}</td>
                    <td>{percentageKey in formattedData && `${formattedData[percentageKey]} %`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Symptoms>
      )}
      <CloseButton
        type="button"
        data-dismiss="modal"
        aria-label={t('main:close')}
        label={t('main:close')}
        handleClick={hide}
      />
    </>
  );
};

export default ModalContent;
