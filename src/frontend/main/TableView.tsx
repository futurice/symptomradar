import React, { useState } from 'react';
import styled from 'styled-components';
import CityTables from './CityTables';
import { CITYSELECTHEIGHT } from './constants';

type TableViewProps = {
  cities: Array<string>;
  data: any;
  isEmbed: boolean;
};

const CitySelect = styled.div`
  height: ${CITYSELECTHEIGHT}px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.grey};
  max-width: 600px;
  margin: 0 auto;

  select {
    max-width: 200px;
  }
`;

const Label = styled.label`
  margin-right: 8px;
`;

const TableView = ({ data, cities, isEmbed }: TableViewProps) => {
  const [selectedCity, setSelectedCity] = useState('');
  const cityList =
    selectedCity === ''
      ? data
      : data.filter((item: any) => {
          return item.city === selectedCity;
        });

  return (
    <>
      <CitySelect>
        <Label htmlFor="city">Kunta</Label>
        <select name="select" id="city" onChange={e => setSelectedCity(e.currentTarget.value)}>
          <option value="">Kaikki kunnat</option>
          {cities.map((city: string) => {
            return (
              <option key={city} value={city}>
                {city}
              </option>
            );
          })}
        </select>
      </CitySelect>
      <CityTables cityList={cityList} isEmbed={isEmbed} />
    </>
  );
};

export default TableView;
