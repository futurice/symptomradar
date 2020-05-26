import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { RouteComponentProps, Link } from '@reach/router';
import * as d3 from 'd3';

import { theme, FILTERS } from '../constants';
import RightArrowIcon from '../assets/RightArrowIcon';
import Body from './Body';

interface OverviewProps extends RouteComponentProps {
  isEmbed: boolean;
  data: any;
}

const Container = styled.div`
  max-width: ${({ theme }) => theme.mobileWidth}px;
  margin: 0 auto;
  padding: 0;

  @media (min-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0 10px;
  }

  h1 {
    font-size: 32px;
    margin-bottom: 5px;
    margin-top: 24px;
    line-height: 1.1;
  }

  h2 {
    font-size: 21px;
    margin: 45px 0 5px 0;
    line-height: 1.1;
  }
  p {
    margin-top: 0;
  }
`;

const MobilePadding = styled.div`
  width: 100%;
  padding: 0 16px;
  @media (min-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0;
  }
`;

const MapLink = styled(Link)`
  background: ${({ theme }) => theme.grey};
  color: ${({ theme }) => theme.white};
  font-weight: bold;
  height: 35px;
  border-radius: 18px;
  text-decoration: none;
  display: inline-flex;
  padding: 0 16px;
  align-items: center;

  svg {
    margin-left: 8px;
  }
`;

const OverviewFooter = styled.div`
  margin: 35px 0;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.black};
`;

const CitySelect = styled.div`
  height: ${({ theme }) => theme.citySelectHeight}px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.grey};
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.mobileWidth}px) {
    padding: 0;
  }

  select {
    max-width: 200px;
  }
`;

const Label = styled.label`
  margin-right: 8px;
`;

const Overview = (props: OverviewProps) => {
  const { t } = useTranslation(['symptoms', 'main']);
  const [selectedCity, setSelectedCity] = useState('');
  const mapPath = props.isEmbed ? '/map-embed' : '/';

  const finlandTotalData = {
    population: 0,
    responses: 0,
    corona_suspicion_yes: 0,
    symptoms: Object.values(FILTERS).map(symptom => ({ symptom: symptom.id, symptomLabel: symptom.label, value: 0 })),
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
  const [dataForSelectedCity, setDataForSelectedCity] = useState(finlandTotalData);
  // This data is not in use at the moment. Commenting out for now.
  // const topCities: any = [...props.data]
  //  .filter((d: any) => d.responses !== -1)
  //  .sort((a, b) => {
  //    return (b.corona_suspicion_yes * 100) / b.responses - (a.corona_suspicion_yes * 100) / a.responses;
  //  })
  //  .filter((d: any, i: number) => i < 10);
  // console.log(topCities);

  const cities: string[] = props.data
    .sort((x: any, y: any) => d3.ascending(x.city, y.city))
    .map((item: any) => {
      return item.city;
    });

  useEffect(() => {
    // Add support for articles that already has iframe-resizer/js/iframeResizer
    // parent running.
    // Using dynamic import to make sure the script iframeResizer.contentWindow
    // is only loaded when this view loads.
    // Since the parent articles that are embedding this page via iframe
    // already have `iframe-resizer/js/iframeResizer` running and waiting, having
    // `iframe-resizer/js/iframeResizer.contentWindow` included in the main bundle,
    // a.k.a using the normal `import ....` syntax at the top of the file,
    // would unwantedly triggers autoresizing for all other views - incuding
    // MapView and CitiesView - which should expect a fixed height iframe instead.
    if (props.isEmbed) {
      import('iframe-resizer/js/iframeResizer.contentWindow');
    }
  }, [props.isEmbed]);

  return (
    <Container>
      <CitySelect>
        <Label htmlFor="city">{t('main:municipality')}</Label>
        <select
          name="select"
          id="city"
          onChange={e => {
            setSelectedCity(e.currentTarget.value);
            let dataSelected = finlandTotalData;
            const data = {
              population: 0,
              responses: 0,
              corona_suspicion_yes: 0,
              symptoms: Object.values(FILTERS).map(symptom => ({
                symptom: symptom.id,
                symptomLabel: symptom.label,
                value: 0,
              })),
            };
            const index = props.data.findIndex((el: any) => e.currentTarget.value === el.city);
            if (index !== -1) {
              let cityData: any = props.data[index];
              data.population = cityData.population;
              if (cityData.responses !== -1) {
                data.responses = cityData.responses;
                data.corona_suspicion_yes = cityData.corona_suspicion_yes;
                data.symptoms.forEach((el: any) => {
                  if (el.symptom === 'fever_yes' || el.symptom === 'cough_yes') {
                    if (el.symptom === 'fever_yes')
                      el.value = el.value + cityData['fever_slight'] + cityData['fever_high'];
                    if (el.symptom === 'cough_yes')
                      el.value = el.value + cityData['cough_intense'] + cityData['cough_mild'];
                  } else el.value += cityData[el.symptom];
                });
              }

              data.symptoms.sort((a, b) => {
                return b.value - a.value;
              });
              dataSelected = data;
            }
            setDataForSelectedCity(dataSelected);
          }}
        >
          <option value="">{t('main:allMunicipalities')}</option>
          {cities.map((city: string) => {
            return (
              <option key={city} value={city}>
                {city}
              </option>
            );
          })}
        </select>
      </CitySelect>
      <Body data={dataForSelectedCity} city={selectedCity} />
      {!props.isEmbed && (
        <MobilePadding>
          <OverviewFooter>
            <MapLink to={mapPath}>
              {t('main:goToMap')}
              <RightArrowIcon fillColor={theme.white} />
            </MapLink>
          </OverviewFooter>
        </MobilePadding>
      )}
    </Container>
  );
};

export default Overview;
