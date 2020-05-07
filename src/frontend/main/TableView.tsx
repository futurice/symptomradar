import React, { useState } from 'react';
import styled from 'styled-components';
import CityTables from './CityTables';

type TableViewProps = {
  cities: Array<string>;
  data: any;
  isEmbed: boolean;
};

const CitySelect = styled.div`
  height: ${({ theme }) => theme.citySelectHeight}px;
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
      <CityTables data={data} selectedCity={selectedCity} isEmbed={isEmbed} />
    </>
  );
};

export default TableView;
