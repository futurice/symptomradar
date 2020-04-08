import React, { useState } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import ModalContent from './ModalContent';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import MapContainer from './map/MapContainer';
import useModal from './useModal';
import responseData from './assets/data/citylevel-opendata-8-4-2020.json';
import CloseIcon from './assets/CloseIcon';

interface mapProperties {
  city?: string;
  name?: string;
  responses: number;
  fever_no: number;
  fever_yes?: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
  cough_yes?: number;
  cough_mild: number;
  cough_intense: number;
  cough_fine: number;
  cough_impaired: number;
  cough_bad: number;
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
}

type FilterButtonProps = {
  isActive: boolean;
};

const data: mapProperties[] = require('./assets/data/citylevel-opendata-8-4-2020.json');

const populationData: { city: string; population: number }[] = require('./assets/data/population.json');

const mapShape: {
  type: string;
  transform: { scale: [number, number]; translate: [number, number] };
  objects: { kuntarajat: { geometries: { properties: { code: string; name: string } }[] } };
} = require('./assets/data/finland-map-without-aland.json'); //map file

const mapShapeData = topojson.feature(mapShape, mapShape.objects.kuntarajat); // creat a features data for the map

const MapNav = styled.div`
  height: 55px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #000000;
`;

const Label = styled.label`
  margin-right: 8px;
`;

const MapWrapper = styled.div`
  text-align: center;
  position: relative;
`;

const FilterWrapper = styled.div`
  position: absolute;
  top: 10px;
  display: flex;
  max-width: 100vw;
  flex-wrap: nowrap;
  padding: 3px 16px;
  overflow: scroll;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const FilterButton = styled(PrimaryButton)<FilterButtonProps>`
  flex: 0 0 auto;
  margin-right: 16px;
  background: ${props => (props.isActive ? '#FFF' : '#595959')};
  color: ${props => (props.isActive ? '#000' : '#FFF')};
  border: ${props => (props.isActive ? '1px solid #000' : '1px solid transparent')};
`;

const MapInfo = styled.div`
  position: fixed;
  bottom: 34px;
  width: 100vw;
  background: rgba(255, 255, 255, 0.6);
  text-align: left;
  padding: 6px 34px 0 20px;
  border-top: 1px solid #000;
  line-height: 1.25;

  p {
    margin: 5px 0;
  }
`;

const TotalResponses = styled.div`
  background: #fff;
  position: fixed;
  bottom: 0;
  padding: 10px 0;
  font-size: 14px;
  font-style: italic;
  width: 100vw;
  font-weight: bold;
  text-align: left;

  p {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  top: 13px;
  right: 4px;
  z-index: 1;
`;

const MapView = (props: RouteComponentProps) => {
  const { isShowing, toggleModal } = useModal();
  const [showMapInfo, setShowMapInfo] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('corona_suspicion_yes');
  const [mapHeight, setMapHeight] = useState(window.innerHeight - 225);
  const [mapWidth, setMapWidth] = useState(window.innerWidth - 25);
  const [activeCityData, setActiveCityData] = useState({});

  const cities: string[] = topojson
    .feature(mapShape, mapShape.objects.kuntarajat)
    .features.sort((x: { properties: mapProperties }, y: { properties: mapProperties }) =>
      d3.ascending(x.properties.name, y.properties.name),
    )
    .map((item: { properties: mapProperties }) => {
      return item.properties.name;
    });

  const totalReponses = responseData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.responses;
  }, 0);

  window.addEventListener('resize', () => {
    setMapHeight(window.innerHeight - 225);
    setMapWidth(window.innerWidth - 25);
  });
  mapShapeData.features.forEach((d: { properties: mapProperties }) => {
    let index = data.findIndex((el: mapProperties) => d.properties.name === el.city);
    if (index !== -1) {
      d.properties = data[index];
      d.properties.fever_yes = d.properties.responses - d.properties.fever_no;
      d.properties.cough_yes = d.properties.responses - d.properties.cough_no;
    } else {
      let indx = populationData.findIndex((el: { city: string; population: number }) => d.properties.name === el.city);
      if (indx !== -1) {
        let obj = {
          city: d.properties.name,
          responses: -1,
          fever_no: -1,
          fever_yes: -1,
          fever_slight: -1,
          fever_high: -1,
          cough_no: -1,
          cough_yes: -1,
          cough_mild: -1,
          cough_intense: -1,
          cough_fine: -1,
          cough_impaired: -1,
          cough_bad: -1,
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
          population: populationData[indx].population,
        };
        d.properties = obj;
      }
    }
  });
  return (
    <>
      <MapNav>
        <Label htmlFor="city">Kaupunki</Label>
        <select
          name=""
          id="city"
          onChange={(event: { target: { value: string } }) => {
            let indx = mapShapeData.features.findIndex(
              (obj: { properties: { city: string } }) => obj.properties.city === event.target.value,
            );
            setActiveCityData(mapShapeData.features[indx]);
            toggleModal();
          }}
        >
          <option value="">Valitse kaupunki...</option>
          {cities.map((city: string) => {
            return (
              <option key={city} value={city}>
                {city}
              </option>
            );
          })}
        </select>
      </MapNav>
      <MapWrapper>
        <MapContainer
          mapShapeData={mapShapeData}
          selectedFilter={selectedFilter}
          mapHeight={mapHeight}
          mapWidth={mapWidth}
          popUpOpen={showMapInfo}
        />
        <FilterWrapper>
          <FilterButton
            type="button"
            label="Epäilys koronasta"
            isActive={selectedFilter === 'corona_suspicion_yes' ? true : false}
            handleClick={() => {
              setSelectedFilter('corona_suspicion_yes');
            }}
          />
          <FilterButton
            type="button"
            label="Yskää"
            isActive={selectedFilter === 'cough_yes' ? true : false}
            handleClick={() => {
              setSelectedFilter('cough_yes');
            }}
          />
          <FilterButton
            type="button"
            label="Kuumetta"
            isActive={selectedFilter === 'fever_yes' ? true : false}
            handleClick={() => {
              setSelectedFilter('fever_yes');
            }}
          />
          <FilterButton
            type="button"
            label="Vaikeuksia hengittää"
            isActive={selectedFilter === 'breathing_difficulties_yes' ? true : false}
            handleClick={() => {
              setSelectedFilter('breathing_difficulties_yes');
            }}
          />
        </FilterWrapper>
        <MapInfo>
          {showMapInfo && (
            <>
              <div className="popUp">
                <CloseButton
                  type="button"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowMapInfo(false)}
                >
                  <CloseIcon />
                </CloseButton>
                <p>
                  Kartta näyttää, millaisia oireita vastaajilla on eri kaupungeissa. Mukana ovat kaupungit, joista on
                  saatu yli 25 vastausta.
                </p>
                <p>Kaupunkien vastauksiin voi tutustua klikkaamalla palloja tai käyttämällä hakuvalikkoa.</p>
              </div>
            </>
          )}
          <TotalResponses>
            <p>Vastauksia yhteensä: {totalReponses.toLocaleString('fi-FI')}</p>
          </TotalResponses>
        </MapInfo>
      </MapWrapper>
      <Modal isShowing={isShowing} hide={toggleModal}>
        <ModalContent content={activeCityData} />
      </Modal>
    </>
  );
};

export default MapView;
