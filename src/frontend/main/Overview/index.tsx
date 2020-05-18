import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TimeSeries from './TimeSeries';
import DonutSuspectingCorona from './DonutSuspectingCorona';
import { RouteComponentProps } from '@reach/router';

import { getLocaleDecimalString, getCurrentLocale } from '../translations';
import { theme, FILTERS, Symptom } from '../constants';
import { CompareFilterToggle } from '../FilterToggle';

interface DashboardViewProps extends RouteComponentProps {
  isEmbed: boolean;
  data: any;
}

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin: 10px 0 30px 0;

  th {
    font-weight: normal;
    text-align: left;

    &:nth-child(3) {
      text-align: right;
    }
  }

  th,
  td {
    padding: 6px 4px;
    line-height: 1.1;
    vertical-align: top;
  }

  th:nth-child(1) {
    width: calc(2ch + 16px);
  }

  th:nth-child(3) {
    /* ch = relative width of a character "0", seems to
     * fit better for adjusting number column width
     * */
    width: calc(17ch + 20px);
    padding-right: 16px;
    padding-left: 4px;
    text-align: right;
  }

  td:nth-child(1) {
    padding-left: 0;
    text-align: right;
  }

  td:nth-child(3) {
    padding-right: 16px;
    padding-left: 4px;
    text-align: left;
  }

  tr:nth-child(2n + 1) {
    background: ${({ theme }) => theme.lightGrey};
  }
`;

const Container = styled.div`
  max-width: ${({ theme }) => theme.mobileWidth}px;
  margin: 0 auto;
  padding: 0 10px;

  @media (max-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0;
  }

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

const MobilePadding = styled.div`
  width: 100%;
  @media (max-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0 16px;
  }
`;

const FiltersWrapper = styled.div`
  margin: 20px 0;
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const ActiveFilter = styled.div`
  color: ${({ theme }) => theme.white};
  font-weight: bold;
  border-radius: 18px;
  padding: 0 16px;
  height: 35px;
  line-height: 35px;
  display: inline-block;
  margin-right: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const FirstActiveFilter = styled(ActiveFilter)`
  background: ${({ theme }) => theme.red};
  margin-left: 8px;
`;

const SecondActiveFilter = styled(ActiveFilter)`
  background: ${({ theme }) => theme.darkBlue};
`;

const initialTotalData = {
  population: 0,
  responses: 0,
  corona_suspicion_yes: 0,
  symptoms: Object.values(FILTERS).map(symptom => ({ symptom: symptom.id, symptomLabel: symptom.label, value: 0 })),
};

const Dashboard = (props: DashboardViewProps) => {
  const [selectedSymptomSecondLine, setSelectedSymptomSecondLine] = useState<Symptom>(Symptom.fever);
  const [selectedSymptomFirstLine, setSelectedSymptomFirstLine] = useState(Symptom.corona_suspicion);
  const { t } = useTranslation(['symptoms', 'main']);
  const currentLocale = getCurrentLocale();
  const finlandTotalData = initialTotalData;
  const { mobileWidth } = theme;

  const setSelectedSymptoms = (firstFilter: Symptom, secondFilter: Symptom) => {
    setSelectedSymptomFirstLine(firstFilter);
    setSelectedSymptomSecondLine(secondFilter);
  };

  props.data.forEach((d: any) => {
    finlandTotalData.population += d.population;
    if (d.responses > -1) {
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
    const percentage = getLocaleDecimalString((d.value * 100) / finlandTotalData.responses);
    return (
      <tr key={`top-symptom-${d.symptom}`}>
        <td>
          <b>{i + 1}.</b>
        </td>
        <td>{t(`symptomLabels:${d.symptomLabel}`)}</td>
        <td>
          {d.value.toLocaleString(currentLocale)}
          {` `}({t('format:percentage', { percentage })})
        </td>
      </tr>
    );
  });

  // This data is not in used at the moment. Commenting out for now.
  // const topCities: any = [...props.data]
  //  .filter((d: any) => d.responses !== -1)
  //  .sort((a, b) => {
  //    return (b.corona_suspicion_yes * 100) / b.responses - (a.corona_suspicion_yes * 100) / a.responses;
  //  })
  //  .filter((d: any, i: number) => i < 10);
  // console.log(topCities);

  return (
    <Container>
      <MobilePadding>
        <h1>{t('main:allOfFinland')}</h1>
        <h2>{t('main:totalResponses')}</h2>
        <NumberText>{finlandTotalData.responses.toLocaleString(currentLocale)}</NumberText> (
        {t(`format:percentage`, {
          percentage: getLocaleDecimalString((finlandTotalData.responses * 100) / finlandTotalData.population),
        })}{' '}
        {t('main:ofPopulation')})<h2>Respondant Suspecting Corona</h2>
        <Div>
          Approx. every{' '}
          <b>
            1 out of {getLocaleDecimalString(finlandTotalData.responses / finlandTotalData.corona_suspicion_yes, 0)}
          </b>{' '}
          people who responded suspect Corona infection.
        </Div>
        <DonutSuspectingCorona
          width={280}
          height={280}
          radius={140}
          data={[
            finlandTotalData.corona_suspicion_yes,
            finlandTotalData.responses - finlandTotalData.corona_suspicion_yes,
          ]}
          color={['#FF5252', '#ececec']}
        />
      </MobilePadding>

      <MobilePadding>
        <h2>{t('main:topSymptoms')}</h2>
      </MobilePadding>

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

      <MobilePadding>
        <h2>Time Development</h2>
      </MobilePadding>

      <FiltersWrapper>
        <FirstActiveFilter>{t(`symptomLabels:${selectedSymptomFirstLine}`)}</FirstActiveFilter>
        <SecondActiveFilter>{t(`symptomLabels:${selectedSymptomSecondLine}`)}</SecondActiveFilter>
        <CompareFilterToggle
          firstSelectedFilter={selectedSymptomFirstLine}
          secondSelectedFilter={selectedSymptomSecondLine}
          handleFilterChange={setSelectedSymptoms}
        />
      </FiltersWrapper>

      <TimeSeries
        width={window.innerWidth > mobileWidth ? 600 : window.innerWidth - 10}
        height={window.innerWidth > 648 ? 400 : ((window.innerWidth - 10) * 3) / 4}
        selectedSymptomFirstLine={selectedSymptomFirstLine}
        selectedSymptom={selectedSymptomSecondLine}
      />
    </Container>
  );
};

export default Dashboard;
