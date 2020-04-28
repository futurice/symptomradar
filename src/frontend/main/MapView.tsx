import React, { useState } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import * as d3 from 'd3';
import FilterToggle from './FilterToggle';
import PrimaryButton from './PrimaryButton';
import MapContainer from './map/MapContainer';
import CloseIcon from './assets/CloseIcon';
import TableView from './TableView';
import { FILTERS, HEADERHEIGHT, NAVHEIGHT } from './constants';

type FilterKey = keyof typeof FILTERS;

interface MapViewProps extends RouteComponentProps {
  responseData: any;
}

type MapNavProps = {
  isActive: boolean;
};

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

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const MapNav = styled(Container)`
  height: ${NAVHEIGHT}px;
  border-bottom: 1px solid ${props => props.theme.grey};
  display: flex;

  @media (min-width: 600px) {
    border-left: 1px solid ${props => props.theme.grey};
    border-right: 1px solid ${props => props.theme.grey};
  }
`;

const MapNavButton = styled.button<MapNavProps>`
  width: 50%;
  background: ${props => (props.isActive ? props.theme.grey : props.theme.white)};
  color: ${props => (props.isActive ? props.theme.white : props.theme.black)};
  border: none;
  font-weight: bold;
`;

const MessageContainer = styled.div`
  text-align: center;
  margin: 24px 0;
`;

const MapWrapper = styled.div`
  text-align: center;
  position: relative;
  height: calc(100vh - (${HEADERHEIGHT}px + ${NAVHEIGHT}px));
`;

const FilterWrapper = styled.div`
  position: absolute;
  top: 10px;
  padding: 3px 16px;
  display: flex;

  @media (min-width: 624px) {
    padding-left: 0;
  }
`;

const ActiveFilter = styled(PrimaryButton)`
  background: ${props => props.theme.grey};
  color: ${props => props.theme.white};
  border: none;
  pointer-events: none;
`;

const MapInfo = styled.div`
  position: fixed;
  bottom: 34px;
  width: 100vw;
  background: ${props => props.theme.white};
  text-align: left;
  border-top: 1px solid ${props => props.theme.black};
  line-height: 1.25;

  p {
    margin: 5px 0;
  }
`;

const MapInfoContent = styled(Container)`
  padding: 6px 34px 0 16px;
  position: relative;

  @media (min-width: 624px) {
    padding-left: 0;
  }
`;

const TotalResponses = styled.div`
  background: ${props => props.theme.white};
  position: fixed;
  bottom: 0px;
  padding: 10px 0 10px 16px;
  font-size: 14px;
  font-style: italic;
  width: 100vw;
  font-weight: bold;
  text-align: left;

  p {
    margin: 0;
  }

  @media (min-width: 624px) {
    padding-left: 0;
  }
`;

const CloseButton = styled.button`
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  padding: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MapView = (props: MapViewProps) => {
  const currentPath = props.location!.pathname;
  const isEmbed = currentPath === '/map-embed';
  const topPartHeight = isEmbed ? NAVHEIGHT : HEADERHEIGHT + NAVHEIGHT;
  const [showMapInfo, setShowMapInfo] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(FILTERS.corona_suspicion_yes.id as FilterKey);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - topPartHeight - 10);
  const data = props.responseData.data;
  const [activeView, setActiveView] = useState<'MAP' | 'TABLE'>('MAP');

  if (props.responseData === 'FETCHING') {
    return <MessageContainer>Loading...</MessageContainer>;
  }

  if (props.responseData === 'ERROR') {
    return <MessageContainer>Error loading data</MessageContainer>;
  }

  const cities: string[] = cartogramData
    .sort((x: mapProperties, y: mapProperties) => d3.ascending(x.city, y.city))
    .map((item: mapProperties) => {
      return item.city;
    });

  const handleFilterChange = (filterName: string) => {
    setSelectedFilter(filterName as FilterKey);
  };

  const totalResponses = data.reduce((accumulator: number, currentValue: any) => {
    return accumulator + currentValue.responses;
  }, 0);

  window.addEventListener('resize', () => {
    setMapHeight(window.innerHeight - topPartHeight - 10);
  });
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
      <MapNav>
        <MapNavButton
          type="button"
          isActive={activeView === 'MAP' ? true : false}
          onClick={() => {
            setActiveView('MAP');
          }}
        >
          Koko Suomi
        </MapNavButton>
        <MapNavButton
          type="button"
          isActive={activeView === 'TABLE' ? true : false}
          onClick={() => {
            setActiveView('TABLE');
          }}
        >
          Valitse kunta
        </MapNavButton>
      </MapNav>
      {activeView === 'MAP' && (
        <MapWrapper>
          <MapContainer
            mapShapeData={dataForMap}
            selectedFilter={selectedFilter}
            mapHeight={mapHeight}
            popUpOpen={showMapInfo}
          />
          <Container>
            <FilterWrapper>
              <FilterToggle selectedFilter={selectedFilter} handleFilterChange={handleFilterChange} />
              <ActiveFilter type="button" label={FILTERS[selectedFilter].label}></ActiveFilter>
            </FilterWrapper>
          </Container>
          <MapInfo>
            {showMapInfo && (
              <>
                <MapInfoContent className="popUp">
                  <CloseButton
                    type="button"
                    data-dismiss="modal"
                    aria-label="Sulje"
                    onClick={() => setShowMapInfo(false)}
                  >
                    <CloseIcon />
                  </CloseButton>
                  <p>
                    Kartta näyttää, millaisia oireita vastaajilla on eri kunnissa. Mukana ovat kunnat, joista on saatu
                    yli 25 vastausta.
                  </p>
                  <p>Kuntien vastauksiin voi tutustua klikkaamalla palloja tai käyttämällä hakuvalikkoa.</p>
                </MapInfoContent>
              </>
            )}
            <TotalResponses>
              <Container>
                <p>Vastauksia yhteensä: {totalResponses.toLocaleString('fi-FI')}</p>
              </Container>
            </TotalResponses>
          </MapInfo>
        </MapWrapper>
      )}
      {activeView === 'TABLE' && <TableView data={data} cities={cities}></TableView>}
    </>
  );
};

export default MapView;
