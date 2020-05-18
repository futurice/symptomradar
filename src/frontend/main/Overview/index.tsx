import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TimeSeries from './TimeSeries';
import DonutSuspectingCorona from './DonutSuspectingCorona';
import { RouteComponentProps } from '@reach/router';

import { getLocaleDecimalString, getCurrentLocale } from '../translations';

interface DashboardViewProps extends RouteComponentProps {
  isEmbed: boolean;
  data: any;
}

interface ColorBoxProps {
  backgroundColor: string;
}

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-bottom: 1px solid #ddd;
  margin: 40px 0 30px 0;

  th {
    font-weight: normal;
    text-align: left;

    &:nth-child(3) {
      text-align: right;
    }
  }

  th,
  td {
    padding: 5px 4px;
    line-height: 1.1;
    vertical-align: top;
  }

  th:nth-child(1),
  td:nth-child(1) {
    padding-left: 0;
    width: 34px;
    text-align: right;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 21ch;
    padding-right: 16px;
    text-align: right;
  }

  tr:nth-child(2n + 1) {
    background: ${({ theme }) => theme.lightGrey};
  }
`;

const Container = styled.div`
  max-width: ${({ theme }) => theme.mobileWidth}px;
  margin: 0 auto;
  padding: 0 10px;

  h1 {
    font-size: 32px;
    margin-bottom: 5px;
    margin-top: 24px;
  }

  h2 {
    font-size: 22px;
    margin: 45px 0 5px 0;
  }
`;

const NumberText = styled.span`
  font-size: 28px;
  font-weight: bold;
`;

const Div = styled.div`
  font-size: 18px;
  font-style: italic;
  margin: 10px 0;
`;

const TableHead = styled.thead`
  tr:first-child {
    background: ${props => props.theme.white};
  }

  th {
    padding: 10px 4px;
    font-size: 14px;
  }
`;

const SelectionContainer = styled.div`
  display: flex;
  align-items: center;
  p {
    margin: 0 10px;
  }
  margin: 20px 0 15px 0;
`;

const CitySelect = styled.div`
  padding: 0;
  display: flex;
  align-items: center;
  max-width: 600px;
  margin: 0;
  select {
    background: ${props => props.theme.lightGrey};
    padding: 5px;
    border-radius: 5px;
  }
`;

const KeyContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Keys = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.7);
  margin-bottom: -30px;
  z-index: 100;
  position: relative;
  width: fit-content;
  p {
    font-size: 14px;
    margin: 0;
  }
`;

const Key = styled.div`
  display: flex;
  margin: 10px;
  align-items: center;
`;

const ColorBox = styled.div<ColorBoxProps>`
  border-radius: 20px;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  background-color: ${props => props.backgroundColor};
`;

const symptomList = [
  {
    symptomID: 'corona_suspicion',
  },
  {
    symptomID: 'fever',
  },
  {
    symptomID: 'cough',
  },
  {
    symptomID: 'breathing_difficulties',
  },
  {
    symptomID: 'muscle_pain',
  },
  {
    symptomID: 'headache',
  },
  {
    symptomID: 'sore_throat',
  },
  {
    symptomID: 'rhinitis',
  },
  {
    symptomID: 'stomach_issues',
  },
  {
    symptomID: 'sensory_issues',
  },
];

const initialTotalData = {
  population: 0,
  responses: 0,
  corona_suspicion_yes: 0,
  symptoms: [
    {
      symptom: 'corona_suspicion_yes',
      symptomLabel: 'corona_suspicion',
      value: 0,
    },
    {
      symptom: 'fever_yes',
      symptomLabel: 'fever',
      value: 0,
    },
    {
      symptom: 'cough_yes',
      symptomLabel: 'cough',
      value: 0,
    },
    {
      symptom: 'breathing_difficulties_yes',
      symptomLabel: 'breathing_difficulties',
      value: 0,
    },
    {
      symptom: 'muscle_pain_yes',
      symptomLabel: 'muscle_pain',
      value: 0,
    },
    {
      symptom: 'headache_yes',
      symptomLabel: 'headache',
      value: 0,
    },
    {
      symptom: 'sore_throat_yes',
      symptomLabel: 'sore_throat',
      value: 0,
    },
    {
      symptom: 'rhinitis_yes',
      symptomLabel: 'rhinitis',
      value: 0,
    },
    {
      symptom: 'stomach_issues_yes',
      symptomLabel: 'stomach_issues',
      value: 0,
    },
    {
      symptom: 'sensory_issues_yes',
      symptomLabel: 'sensory_issues',
      value: 0,
    },
  ],
};

const Dashboard = (props: DashboardViewProps) => {
  const [selectedSymptomSecondLine, setSelectedSymptomSecondLine] = useState('fever');
  const [selectedSymptomFirstLine, setSelectedSymptomFirstLine] = useState('corona_suspicion');
  const { t } = useTranslation(['symptoms', 'main']);
  const currentLocale = getCurrentLocale();
  const finlandTotalData = initialTotalData;

  props.data.forEach((d: any) => {
    finlandTotalData.population += d.population;
    if (d.responses !== -1) {
      finlandTotalData.responses += d.responses;
      finlandTotalData.corona_suspicion_yes += d.corona_suspicion_yes;
      finlandTotalData.symptoms.forEach((el: any) => {
        if (el.symptom === 'fever_yes' || el.symptom === 'cough_yes') {
          if (el.symptom === 'fever_yes') el.value = el.value + d['fever_slight'] + d['fever_high'];
          if (el.symptom === 'cough_yes') el.value = el.value + d['cough_intense'] + d['cough_mild'];
        } else el.value += d[el.symptom];
      });
    }
  });

  finlandTotalData.symptoms.sort((a, b) => {
    return b.value - a.value;
  });

  const tableRow = finlandTotalData.symptoms.map((d, i: number) => {
    return (
      <tr key={`top-symptom-${d.symptom}`}>
        <td>
          <b>{i + 1}.</b>
        </td>
        <td>{t(`symptomLabels:${d.symptomLabel}`)}</td>
        <td>
          {d.value.toLocaleString(currentLocale)} (
          {getLocaleDecimalString((d.value * 100) / finlandTotalData.responses)}
          %)
        </td>
      </tr>
    );
  });

  const topCities: any = [...props.data]
    .filter((d: any) => d.responses !== -1)
    .sort((a, b) => {
      return (b.corona_suspicion_yes * 100) / b.responses - (a.corona_suspicion_yes * 100) / a.responses;
    })
    .filter((d: any, i: number) => i < 10);

  console.log(topCities);

  return (
    <Container>
      <h1>{t('main:allOfFinland')}</h1>
      <h2>{t('main:totalResponses')}</h2>
      <NumberText>{finlandTotalData.responses.toLocaleString(currentLocale)}</NumberText> (
      {t(`format:percentage`, {
        percentage: getLocaleDecimalString((finlandTotalData.responses * 100) / finlandTotalData.population),
      })}{' '}
      {t('main:ofPopulation')})<h2>Respondant Suspecting Corona</h2>
      <Div>
        Approx. every{' '}
        <b>1 out of {getLocaleDecimalString(finlandTotalData.responses / finlandTotalData.corona_suspicion_yes, 0)}</b>{' '}
        people who responded suspect Corona infection.
      </Div>
      <DonutSuspectingCorona
        width={320}
        height={320}
        radius={160}
        data={[
          finlandTotalData.corona_suspicion_yes,
          finlandTotalData.responses - finlandTotalData.corona_suspicion_yes,
        ]}
        color={['#FF5252', '#ececec']}
      />
      <h2>{t('main:topSymptoms')}</h2>
      <Table>
        <TableHead>
          <tr>
            <th></th>
            <th></th>
            <th>
              <i>{t('main:respondents')}</i>
            </th>
          </tr>
        </TableHead>
        <tbody>{tableRow}</tbody>
      </Table>
      <h2>Time Development</h2>
      <SelectionContainer>
        <CitySelect>
          <select
            name="select"
            id="symptom1"
            value={selectedSymptomFirstLine}
            onChange={e => setSelectedSymptomFirstLine(e.currentTarget.value)}
          >
            {symptomList.map((symptom: { symptomID: string }, i: number) => {
              return (
                <option key={i} value={symptom.symptomID}>
                  {t(`symptomLabels:${symptom.symptomID}`)}
                </option>
              );
            })}
          </select>
        </CitySelect>
        <p>v/s</p>
        <CitySelect>
          <select
            name="select"
            id="symptom2"
            value={selectedSymptomSecondLine}
            onChange={e => setSelectedSymptomSecondLine(e.currentTarget.value)}
          >
            {symptomList.map((symptom: { symptomID: string }, i: number) => {
              return (
                <option key={i} value={symptom.symptomID}>
                  {t(`symptomLabels:${symptom.symptomID}`)}
                </option>
              );
            })}
          </select>
        </CitySelect>
      </SelectionContainer>
      <KeyContainer>
        <Keys>
          <Key>
            <ColorBox backgroundColor="#FF5252" />
            <p>{t(`symptomLabels:${selectedSymptomFirstLine}`)}</p>
          </Key>
          <Key>
            <ColorBox backgroundColor="#241A5F" />
            <p>{t(`symptomLabels:${selectedSymptomSecondLine}`)}</p>
          </Key>
        </Keys>
      </KeyContainer>
      <TimeSeries
        width={window.innerWidth > 648 ? 600 : window.innerWidth - 48}
        height={window.innerWidth > 648 ? 400 : ((window.innerWidth - 48) * 2) / 3}
        selectedSymptomFirstLine={selectedSymptomFirstLine}
        selectedSymptom={selectedSymptomSecondLine}
      />
    </Container>
  );
};

export default Dashboard;
