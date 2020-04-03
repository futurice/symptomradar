import React from 'react';
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

const MapView = (props: RouteComponentProps) => {
  const { isShowing, toggle } = useModal();
  const cities = responseData.map(item => {
    return item.City;
  });

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
      </MapWrapper>
      <Modal isShowing={isShowing} hide={toggle} modalTitle={'Uusimaa'}>
        <ModalContent region="Uusimaa" />
      </Modal>
    </>
  );
};

export default MapView;
