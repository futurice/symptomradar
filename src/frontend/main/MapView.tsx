import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from '@reach/router';
import ModalContent from './ModalContent';
import Modal from './Modal';
import Map from './map/Map';
import useModal from './useModal';

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
  padding: 24px;
`;

const MapView = (props: RouteComponentProps) => {
  const { isShowing, toggle } = useModal();

  return (
    <>
      <MapNav>
        <Label htmlFor="region">Maakunta</Label>
        <select name="" id="region">
          <option value="Ahvenanmaa">Ahvenanmaa</option>
          <option value="Etelä-Karjala">Etelä-Karjala</option>
          <option value="Etelä-Pohjanmaa">Etelä-Pohjanmaa</option>
          <option value="Etelä-Savo">Etelä-Savo</option>
          <option value="Kainuu">Kainuu</option>
          <option value="Kanta-Häme">Kanta-Häme</option>
          <option value="Keski-Pohjanmaa">Keski-Pohjanmaa</option>
          <option value="Keski-Suomi">Keski-Suomi</option>
          <option value="Kymenlaakso">Kymenlaakso</option>
          <option value="Lappi">Lappi</option>
          <option value="Pirkanmaa">Pirkanmaa</option>
          <option value="Pohjanmaa">Pohjanmaa</option>
          <option value="Pohjois-Karjala">Pohjois-Karjala</option>
          <option value="Pohjois-Pohjanmaa">Pohjois-Pohjanmaa</option>
          <option value="Pohjois-Savo">Pohjois-Savo</option>
          <option value="Päijät-Häme">Päijät-Häme</option>
          <option value="Satakunta">Satakunta</option>
          <option value="Uusimaa">Uusimaa</option>
          <option value="Varsinais-Suomi">Varsinais-Suomi</option>
        </select>
      </MapNav>
      <MapWrapper>
        <Map></Map>
        <button onClick={toggle}>Show region info</button>
      </MapWrapper>
      <Modal isShowing={isShowing} hide={toggle} modalTitle={'Uusimaa'}>
        <ModalContent region="Uusimaa" />
      </Modal>
    </>
  );
};

export default MapView;