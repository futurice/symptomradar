import React from 'react';
import styled from 'styled-components';

type TableViewProps = {
  cities: any;
  data: any;
};

const CitySelect = styled.div`
  height: 58px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.grey};
  max-width: 600px;
  margin: 0 auto;
`;

const Label = styled.label`
  margin-right: 8px;
`;

const TableView = ({ data, cities }: TableViewProps) => {
  console.log(data);
  return (
    <>
      <CitySelect>
        <Label htmlFor="city">Kunta</Label>
        <select name="" id="city">
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
      {data.map((item: any) => {
        return (
          <div key={item.city}>
            <h3>{item.city}</h3>
            <p>Vastauksia yhteensä {item.responses}</p>
            <table>
              <thead>
                <tr>
                  <th>Oireet</th>
                  <th>Vastauksia</th>
                  <th>Osuus väkiluvusta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                </tr>
                <tr>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                </tr>
                <tr>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                  <td>{item.cough_no}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
};

export default TableView;
