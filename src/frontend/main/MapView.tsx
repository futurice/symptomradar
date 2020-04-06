import React, { useState } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import * as topojson from 'topojson';
import ModalContent from './ModalContent';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import MapContainer from './map/MapContainer';
import useModal from './useModal';
import responseData from './assets/data/citylevel-opendata-3-4-2020.json';

interface mapProperties {
  City?: string;
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
  Population: number;
}

const data: mapProperties[] = require('./assets/data/citylevel-opendata-3-4-2020.json');

const populationData: { City: string; population: number }[] = require('./assets/data/population.json');

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
  padding: 0 16px;
  overflow: scroll;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

const FilterButton = styled(PrimaryButton)`
  flex: 0 0 auto;
  margin-right: 16px;
`;

const MapInfo = styled.div`
  position: fixed;
  bottom: 0;
  width: 100vw;
  background: #fff;
  text-align: left;
  padding: 6px 30px 6px 16px;
  border-top: 1px solid #000;
  line-height: 1.25;
  padding-bottom: 24px;

  p {
    margin: 12px 0;
  }
`;

const TotalResponses = styled.div`
  background: #fff;
  position: fixed;
  bottom: 0;
  padding: 4px 4px 4px 0;
  font-size: 14px;
  font-style: italic;
  width: 100vw;
  text-align: left;

  p {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  font-size: 46px;
  font-weight: 300;
  line-height: 1;
  color: #000;
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  top: 9px;
  right: 6px;
  z-index: 1;
`;

const MapView = (props: RouteComponentProps) => {
  const { isShowing, toggleModal } = useModal();
  const [showMapInfo, setShowMapInfo] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('corona_suspicion_yes');
  const [activeCityData, setActiveCityData] = useState({});

  const cities = responseData.map(item => {
    return item.City;
  });

  const totalReponses = responseData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.responses;
  }, 0);

  mapShapeData.features.forEach((d: { properties: mapProperties }) => {
    let index = data.findIndex((el: mapProperties) => d.properties.name === el.City);
    if (index !== -1) {
      d.properties = data[index];
      d.properties.fever_yes = d.properties.responses - d.properties.fever_no;
      d.properties.cough_yes = d.properties.responses - d.properties.cough_no;
    } else {
      let indx = populationData.findIndex((el: { City: string; population: number }) => d.properties.name === el.City);
      if (indx !== -1) {
        let obj = {
          City: d.properties.name,
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
          Population: populationData[indx].population,
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
              (obj: { properties: { City: string } }) => obj.properties.City === event.target.value,
            );
            setActiveCityData(mapShapeData.features[indx]);
            toggleModal();
          }}
        >
          <option value="">Valitse kaupunki...</option>
          {cities.map(city => {
            return (
              <option key={city} value={city}>
                {city}
              </option>
            );
          })}
        </select>
      </MapNav>
      <MapWrapper>
        <MapContainer mapShapeData={mapShapeData} selectedFilter={selectedFilter} />
        <FilterWrapper>
          <FilterButton
            type="button"
            label="Epäilys koronasta"
            filterSelection="corona_suspicion_yes"
            click={(e: string) => {
              setSelectedFilter(e);
            }}
          />
          <FilterButton
            type="button"
            label="Yskää"
            filterSelection="cough_yes"
            click={(e: string) => {
              setSelectedFilter(e);
            }}
          />
          <FilterButton
            type="button"
            label="Kuumetta"
            filterSelection="fever_yes"
            click={(e: string) => {
              setSelectedFilter(e);
            }}
          />
        </FilterWrapper>
        <MapInfo>
          {showMapInfo && (
            <>
              <CloseButton type="button" data-dismiss="modal" aria-label="Close" onClick={() => setShowMapInfo(false)}>
                <span aria-hidden="true">&times;</span>
              </CloseButton>
              <p>
                Kartta näyttää, millaisia oireita vastaajilla on eri kunnissa. Mukana ovat kunnat, joista on saatu yli
                25 vastausta.
              </p>
              <p>Kuntien vastauksiin voi tutustua klikkaamalla palloja tai käyttämällä hakuvalikkoa.</p>
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
