import React from 'react';
import styled from 'styled-components';
import ResponseDataHandler from './ResponseDataHandler';

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

const TableViewWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const TableContainer = styled.div`
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.grey};
  padding: 0 0 24px 0;

  p {
    margin: 0 0 4px 0;
  }
`;

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;

  th {
    font-weight: normal;

    &:nth-child(1) {
      text-align: left;
    }
  }

  th,
  td {
    padding: 1px 4px;
    width: 90px;

    @media (min-width: 450px) {
      padding-left: 0;
      width: 140px;
    }
  }

  th:nth-child(1),
  td:nth-child(1) {
    padding-left: 16px;
    width: auto;
  }

  th:nth-child(3),
  td:nth-child(3) {
    padding-right: 16px;
  }

  td {
    text-align: center;
  }

  tbody tr:nth-child(1) {
    th,
    td {
      padding-top: 8px;
    }
  }
`;

const TableHead = styled.thead`
  background: ${props => props.theme.lightGrey};

  th {
    padding: 6px 4px;
    font-style: italic;
    font-size: 14px;
  }
`;

const CityHeadingContainer = styled.h2`
  padding: 0 16px;
`;

const Description = styled.p`
  font-weight: normal;
  font-style: italic;
`;

const CityHeading = styled.h2`
  font-size: 21px;
  margin-bottom: 8px;
`;

const Label = styled.label`
  margin-right: 8px;
`;

const TableView = ({ data, cities }: TableViewProps) => {
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
      <TableViewWrapper>
        {data.map((item: any) => {
          const formattedData = ResponseDataHandler(item);

          return (
            <TableContainer key={item.city}>
              <CityHeadingContainer>
                <CityHeading>{item.city}</CityHeading>
                <p>Vastauksia yhteensä {formattedData.responsesTotal}</p>
                <Description>{formattedData.percentageOfPopulation} % väkiluvusta</Description>
              </CityHeadingContainer>
              <Table>
                <TableHead>
                  <tr>
                    <th>Oireet</th>
                    <th>Vastauksia</th>
                    <th>Osuus väkiluvusta</th>
                  </tr>
                </TableHead>
                <tbody>
                  <tr>
                    <th scope="row">Epäilys koronavirus&shy;tartunnasta</th>
                    <td>{formattedData.suspicionTotal}</td>
                    <td>{formattedData.suspicionPercentage} %</td>
                  </tr>
                  <tr>
                    <th scope="row">Yskää</th>
                    <td>{formattedData.coughTotal}</td>
                    <td>{formattedData.coughPercentage} %</td>
                  </tr>
                  <tr>
                    <th scope="row">Kuumetta</th>
                    <td>{formattedData.feverTotal}</td>
                    <td>{formattedData.feverPercentage} %</td>
                  </tr>
                  <tr>
                    <th scope="row">Vaikeuksia hengittää</th>
                    <td>{formattedData.breathingDifficultiesTotal}</td>
                    <td>{formattedData.breathingDifficultiesPercentage} %</td>
                  </tr>
                </tbody>
              </Table>
            </TableContainer>
          );
        })}
      </TableViewWrapper>
    </>
  );
};

export default TableView;
