import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TimeSeries from './TimeSeries';
import DonutSuspectingCorona from './DonutSuspectingCorona';

import { getLocaleDecimalString, getCurrentLocale } from '../translations';
import { theme, Symptom } from '../constants';
import { CompareFilterToggle } from '../FilterToggle';

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
    width: calc(17ch + 26px);
    padding-right: 16px;
    padding-left: 4px;
    text-align: left;
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
const NumberText = styled.span`
  font-size: 28px;
  font-weight: bold;
`;

const SubHeadline = styled.div`
  font-size: 18px;
  font-style: italic;
  margin-bottom: 10px;
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
  padding: 0 16px;
  @media (min-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0;
  }
`;

const FiltersWrapper = styled.div`
  margin: 20px 0;
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const Div = styled.div`
  padding: 20px 0;
  text-align: center;
  font-weigh: bold;
  background-color: #fafafa;
  font-style: italic;
`;
const Body: React.FunctionComponent<{ data: any; city: string }> = props => {
  const currentLocale = getCurrentLocale();
  const { t } = useTranslation(['main']);
  const [[timeSeriesWidth, timeSeriesHeight], setTimeSeriesSizes] = useState<[number, number]>([
    window.innerWidth > theme.mobileWidth ? 600 : window.innerWidth - 10,
    window.innerWidth > theme.mobileWidth ? 400 : ((window.innerWidth - 10) * 3) / 4,
  ]);
  const [selectedSymptomSecondLine, setSelectedSymptomSecondLine] = useState<Symptom>(Symptom.fever);
  const [selectedSymptomFirstLine, setSelectedSymptomFirstLine] = useState(Symptom.corona_suspicion);

  const setSelectedSymptoms = (firstFilter: Symptom, secondFilter: Symptom) => {
    setSelectedSymptomFirstLine(firstFilter);
    setSelectedSymptomSecondLine(secondFilter);
  };

  useEffect(() => {
    const resizeTimeSeries = () => {
      setTimeSeriesSizes([
        window.innerWidth > theme.mobileWidth ? 600 : window.innerWidth - 10,
        window.innerWidth > theme.mobileWidth ? 400 : ((window.innerWidth - 10) * 3) / 4,
      ]);
    };
    window.addEventListener('resize', resizeTimeSeries);
    return () => window.removeEventListener('resize', resizeTimeSeries);
  }, [setTimeSeriesSizes]);

  const tableRow = props.data.symptoms.map((d: any, i: number) => {
    const percentage = getLocaleDecimalString((d.value * 100) / props.data.responses);
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

  let timeSeries = (
    <div>
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
        width={timeSeriesWidth}
        height={timeSeriesHeight}
        selectedSymptomFirstLine={selectedSymptomFirstLine}
        selectedSymptom={selectedSymptomSecondLine}
      />
    </div>
  );

  if (props.city !== '') {
    timeSeries = <Div>{t('main:onlyApplicableForWholeFinland')}</Div>;
  }

  return (
    <>
      <MobilePadding>
        <h1>{props.city === '' ? t('main:allOfFinland') : props.city}</h1>
        <h2>{t('main:totalResponses')}</h2>
        <NumberText>{props.data.responses.toLocaleString(currentLocale)}</NumberText> (
        {t(`format:percentage`, {
          percentage: getLocaleDecimalString((props.data.responses * 100) / props.data.population),
        })}{' '}
        {t('main:ofPopulation')})<h2>{t('main:respondantSuspectingCorona')}</h2>
        <SubHeadline>
          {t('main:approxOutOf', {
            denominator: getLocaleDecimalString(props.data.responses / props.data.corona_suspicion_yes, 0),
          })}
        </SubHeadline>
      </MobilePadding>

      <DonutSuspectingCorona
        width={310}
        height={310}
        radius={155}
        data={[props.data.corona_suspicion_yes, props.data.responses - props.data.corona_suspicion_yes]}
        color={['#FF5252', '#ececec']}
      />

      <MobilePadding>
        <h2 id="top-symptoms-table-heading">{t('main:topSymptoms')}</h2>
      </MobilePadding>

      <Table aria-labelledby="top-symptoms-table-heading">
        <TableHead>
          <tr>
            <th scope="row"></th>
            <th scope="row"></th>
            <th scope="row">
              <i>{t('main:positiveResponses')}</i>
            </th>
          </tr>
        </TableHead>
        <tbody>{tableRow}</tbody>
      </Table>

      <MobilePadding>
        <h2>{t('main:timeDevelopment')}</h2>
        <p>{t('main:selectTwoSymptomsToCompare')}</p>
      </MobilePadding>
      {timeSeries}
    </>
  );
};

export default Body;
