import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Router, RouteComponentProps } from '@reach/router';
import * as d3 from 'd3';
import MapView from './map/MapView';
import TableView from './TableView';
import Overview from './Overview';

import SubNav from './SubNav';

interface MainWrapperProps extends RouteComponentProps {
  responseData: any;
  isEmbed: boolean;
}

interface mapProperties {
  city: string;
  responses: number;
  fever_no: number;
  fever_yes: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
  cough_yes: number;
  cough_mild: number;
  cough_intense: number;
  general_wellbeing_fine: number;
  general_wellbeing_impaired: number;
  general_wellbeing_bad: number;
  breathing_difficulties_no: number;
  breathing_difficulties_yes: number;
  muscle_pain_no: number;
  muscle_pain_yes: number;
  headache_no: number;
  headache_yes: number;
  sore_throat_no: number;
  sore_throat_yes: number;
  rhinitis_no: number;
  rhinitis_yes: number;
  stomach_issues_no: number;
  stomach_issues_yes: number;
  sensory_issues_no: number;
  sensory_issues_yes: number;
  longterm_medication_no: number;
  longterm_medication_yes: number;
  smoking_no: number;
  smoking_yes: number;
  corona_suspicion_no: number;
  corona_suspicion_yes: number;
  population: number;
  x: number;
  y: number;
}

const cartogramData: mapProperties[] = require('./assets/data/cartogram-coordinates.json');

const MessageContainer = styled.div`
  text-align: center;
  margin: 24px 0;
`;

const MainWrapper = (props: MainWrapperProps) => {
  const { isEmbed } = props;
  const { t } = useTranslation(['main']);

  if (props.responseData === 'FETCHING') {
    return <MessageContainer>{t('main:loading')}</MessageContainer>;
  }

  if (props.responseData === 'ERROR') {
    return <MessageContainer>{t('main:errorLoadingData')}</MessageContainer>;
  }

  const data = props.responseData.data;
  const lastUpdated = new Date(props.responseData.meta.generated);

  const cities: string[] = cartogramData
    .sort((x: mapProperties, y: mapProperties) => d3.ascending(x.city, y.city))
    .map((item: mapProperties) => {
      return item.city;
    });

  const totalResponses = data.reduce((accumulator: number, currentValue: any) => {
    if (currentValue.responses < 0) return accumulator;
    return accumulator + currentValue.responses;
  }, 0);

  let dataForMap: mapProperties[] = cartogramData.map((d: mapProperties) => {
    let index = data.findIndex((el: mapProperties) => d.city === el.city);
    let obj: mapProperties = {
      city: d.city,
      responses: -1,
      fever_no: -1,
      fever_yes: -1,
      fever_slight: -1,
      fever_high: -1,
      cough_no: -1,
      cough_yes: -1,
      cough_mild: -1,
      cough_intense: -1,
      general_wellbeing_fine: -1,
      general_wellbeing_impaired: -1,
      general_wellbeing_bad: -1,
      breathing_difficulties_no: -1,
      breathing_difficulties_yes: -1,
      muscle_pain_no: -1,
      muscle_pain_yes: -1,
      headache_no: -1,
      headache_yes: -1,
      sore_throat_no: -1,
      sore_throat_yes: -1,
      rhinitis_no: -1,
      rhinitis_yes: -1,
      stomach_issues_no: -1,
      stomach_issues_yes: -1,
      sensory_issues_no: -1,
      sensory_issues_yes: -1,
      longterm_medication_no: -1,
      longterm_medication_yes: -1,
      smoking_no: -1,
      smoking_yes: -1,
      corona_suspicion_no: -1,
      corona_suspicion_yes: -1,
      population: d.population,
      x: d.x,
      y: d.y,
    };
    if (index !== -1) {
      obj.responses = data[index].responses;
      obj.fever_no = data[index].fever_no;
      obj.fever_yes = data[index].responses - data[index].fever_no;
      obj.fever_slight = data[index].fever_slight;
      obj.fever_high = data[index].fever_high;
      obj.cough_no = data[index].cough_no;
      obj.cough_yes = data[index].responses - data[index].cough_no;
      obj.cough_mild = data[index].cough_mild;
      obj.cough_intense = data[index].cough_intense;
      obj.general_wellbeing_fine = data[index].general_wellbeing_fine;
      obj.general_wellbeing_impaired = data[index].general_wellbeing_impaired;
      obj.general_wellbeing_bad = data[index].general_wellbeing_bad;
      obj.breathing_difficulties_no = data[index].breathing_difficulties_no;
      obj.breathing_difficulties_yes = data[index].breathing_difficulties_yes;
      obj.muscle_pain_no = data[index].muscle_pain_no;
      obj.muscle_pain_yes = data[index].muscle_pain_yes;
      obj.headache_no = data[index].headache_no;
      obj.headache_yes = data[index].headache_yes;
      obj.sore_throat_no = data[index].sore_throat_no;
      obj.sore_throat_yes = data[index].sore_throat_yes;
      obj.rhinitis_no = data[index].rhinitis_no;
      obj.rhinitis_yes = data[index].rhinitis_yes;
      obj.stomach_issues_no = data[index].stomach_issues_no;
      obj.stomach_issues_yes = data[index].stomach_issues_yes;
      obj.sensory_issues_no = data[index].sensory_issues_no;
      obj.sensory_issues_yes = data[index].sensory_issues_yes;
      obj.longterm_medication_no = data[index].longterm_medication_no;
      obj.longterm_medication_yes = data[index].longterm_medication_yes;
      obj.smoking_no = data[index].smoking_no;
      obj.smoking_yes = data[index].smoking_yes;
      obj.corona_suspicion_no = data[index].corona_suspicion_no;
      obj.corona_suspicion_yes = data[index].corona_suspicion_yes;
    }
    return obj;
  });

  return (
    <>
      <SubNav isEmbed={isEmbed} />
      <Router>
        <MapView
          path="/"
          isEmbed={isEmbed}
          dataForMap={dataForMap}
          totalResponses={totalResponses}
          lastUpdated={lastUpdated}
        />
        <TableView path="dashboard" isEmbed={isEmbed} cities={cities} data={data} lastUpdated={lastUpdated} />
        <Overview path="overview" isEmbed={isEmbed} data={data} />
      </Router>
    </>
  );
};

export default MainWrapper;
