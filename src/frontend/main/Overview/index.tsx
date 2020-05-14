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

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-bottom: 1px solid #ddd;
  margin: 16px 0 30px 0;

  th {
    font-weight: normal;
    text-align: left;

    &:nth-child(3) {
      text-align: right;
    }
  }

  th,
  td {
    padding: 10px 4px;

    @media (min-width: 450px) {
      width: 140px;
    }
  }

  th:nth-child(1),
  td:nth-child(1) {
    padding-left: 16px;
    width: 7%;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 25%;
    padding-right: 16px;
    text-align: right;
  }

  tr:nth-child(2n) {
    background: #f1f1f1;
  }
`;

const Container = styled.div`
  max-width: 648px;
  margin: 0 auto;
  padding: 24px;
`;

const MessageContainer = styled.div`
  text-align: center;
  margin: 24px 0;
`;

const Heading = styled.div`
  font-size: 22px;
  font-weight: bold;
  margin: 30px 0 5px 0;
`;

const H1 = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const P = styled.p`
  margin-top: 0;
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

const SpanBold = styled.span`
  font-weight: bold;
`;

const TableHead = styled.thead`
  background: ${props => props.theme.lightGrey};

  th {
    padding: 10px 4px;
    font-weight: bold;
    font-size: 14px;
  }
`;

const CitySelect = styled.div`
  height: ${({ theme }) => theme.citySelectHeight}px;
  padding: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.grey};
  max-width: 600px;
  margin: 0 auto;

  select {
    max-width: 200px;
  }
  margin-bottom: 20px;
`;

const Label = styled.label`
  margin-right: 8px;
`;

const symptomList = [
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

const Dashboard = (props: DashboardViewProps) => {
  const [selectedSymptom, setSelectedSymptom] = useState('fever');
  const { t } = useTranslation(['symptoms', 'main']);
  const currentLocale = getCurrentLocale();
  const finlandTotalData = {
    population: 0,
    responses: 0,
    corona_suspicion_yes: 0,
    symptoms: [
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
        <td>{i + 1}</td>
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
      <H1>{t('main:allOfFinland')}</H1>
      <Heading>{t('main:totalResponses')}</Heading>
      <P>
        <NumberText>{finlandTotalData.responses.toLocaleString(currentLocale)}</NumberText> (
        {t(`format:percentage`, {
          percentage: getLocaleDecimalString((finlandTotalData.responses * 100) / finlandTotalData.population),
        })}{' '}
        {t('main:ofPopulation')})
      </P>
      <Heading>Respondant Suspecting Corona</Heading>
      <Div>
        Approx. every{' '}
        <SpanBold>
          1 out of {getLocaleDecimalString(finlandTotalData.responses / finlandTotalData.corona_suspicion_yes, 0)}
        </SpanBold>{' '}
        people who responded suspect Corona infection.
      </Div>
      <DonutSuspectingCorona
        width={320}
        height={280}
        radius={140}
        data={[
          finlandTotalData.corona_suspicion_yes,
          finlandTotalData.responses - finlandTotalData.corona_suspicion_yes,
        ]}
        color={['#FF5252', '#ececec']}
      />
      <Heading>Top Symptoms</Heading>
      <Table>
        <TableHead>
          <tr>
            <th>Sr. No.</th>
            <th>{t('main:symptoms')}</th>
            <th>+ve Responses</th>
          </tr>
        </TableHead>
        <tbody>{tableRow}</tbody>
      </Table>
      <Heading>Time Development</Heading>
      <P>Select a symptom to see its development over time. Swipe to the right to reveal more information.</P>
      <CitySelect>
        <Label htmlFor="symptom">Add a symptom</Label>
        <select name="select" id="symptom" onChange={e => setSelectedSymptom(e.currentTarget.value)}>
          {symptomList.map((symptom: { symptomID: string }, i: number) => {
            return (
              <option key={i} value={symptom.symptomID}>
                {t(`symptomLabels:${symptom.symptomID}`)}
              </option>
            );
          })}
        </select>
      </CitySelect>
      <TimeSeries
        width={window.innerWidth > 648 ? 600 : window.innerWidth - 48}
        height={window.innerWidth > 648 ? 400 : ((window.innerWidth - 48) * 2) / 3}
        selectedSymptom={selectedSymptom}
      />
    </Container>
  );
};

export default Dashboard;
