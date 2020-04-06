import React, { useState } from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import ModalContent from './ModalContent';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import Map from './map/Map';
import useModal from './useModal';
import responseData from './map/citylevel-opendata-3-4-2020.json';

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

  p {
    margin: 12px;
  }
`;

const TotalResponses = styled.div`
  background: #fff;
  position: fixed;
  bottom: 0;
`;

const CloseButton = styled.button`
  font-size: 1.6rem;
  font-weight: 300;
  line-height: 1;
  color: #000;
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  top: 14px;
  right: 6px;
  z-index: 1;
`;

const MapView = (props: RouteComponentProps) => {
  const { isShowing, toggleModal } = useModal();
  const [showMapInfo, setShowMapInfo] = useState(true);

  const cities = responseData.map(item => {
    return item.City;
  });

  const totalReponses = responseData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.responses;
  }, 0);

  return (
    <>
      <MapNav>
        <Label htmlFor="city">Kaupunki</Label>
        <select name="" id="city">
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
        <Map></Map>
        <FilterWrapper>
          <FilterButton type="button" label="Epäilys koronasta" />
          <FilterButton type="button" label="Yskää" />
          <FilterButton type="button" label="Kuumetta" />
        </FilterWrapper>
        {showMapInfo && (
          <MapInfo>
            <CloseButton type="button" data-dismiss="modal" aria-label="Close" onClick={() => setShowMapInfo(false)}>
              <span aria-hidden="true">&times;</span>
            </CloseButton>
            <p>
              Kartta näyttää, millaisia oireita vastaajilla on eri kunnissa. Mukana ovat kunnat, joista on saatu yli 25
              vastausta.
            </p>
            <p>Kuntien vastauksiin voi tutustua klikkaamalla palloja tai käyttämällä hakuvalikkoa.</p>
          </MapInfo>
        )}
        <TotalResponses>
          <p>Vastauksia yhteensä: {totalReponses.toLocaleString('fi-FI')}</p>
        </TotalResponses>
      </MapWrapper>
      <Modal isShowing={isShowing} hide={toggleModal}>
        {/* <ModalContent content={{}} /> */}
      </Modal>
    </>
  );
};

export default MapView;
