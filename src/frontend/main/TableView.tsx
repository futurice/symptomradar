import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CityTables from './CityTables';
import { RouteComponentProps } from '@reach/router';
import { getCurrentLocale } from './translations';

interface TableViewProps extends RouteComponentProps {
  cities: Array<string>;
  data: any;
  isEmbed: boolean;
  lastUpdated: Date;
}

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

const LastUpdated = styled.div<{ topBorder?: boolean }>`
  max-width: 600px;
  margin: 0 auto;
  border-top: ${({ theme }) => `1px solid ${theme.black}`};
  text-transform: capitalize;
  padding: 8px 0;
`;

const LastUpdatedWrapper = styled.div`
  background: ${props => props.theme.white};
  position: fixed;
  bottom: 0px;
  font-size: 14px;
  font-style: italic;
  width: 100%;
  text-align: left;

  p {
    margin: 0;
  }

  @media (min-width: 624px) {
    padding-left: 0;
  }
`;

const TableView = ({ data, cities, isEmbed, lastUpdated }: TableViewProps) => {
  const [selectedCity, setSelectedCity] = useState('');
  const { t } = useTranslation(['main']);

  return (
    <>
      <CitySelect>
        <Label htmlFor="city">{t('main:municipality')}</Label>
        <select name="select" id="city" onChange={e => setSelectedCity(e.currentTarget.value)}>
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
      <CityTables data={data} selectedCity={selectedCity} isEmbed={isEmbed} />
      <LastUpdatedWrapper>
        <LastUpdated>
          {t('main:lastUpdated')}: {lastUpdated.toLocaleDateString(getCurrentLocale())}
        </LastUpdated>
      </LastUpdatedWrapper>
    </>
  );
};

export default TableView;
