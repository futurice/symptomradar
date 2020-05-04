import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import handleResponseData from './handleResponseData';
import { NAVHEIGHT, CITYSELECTHEIGHT } from './constants';

type CityTablesProps = {
  data: any;
  selectedCity: string;
  isEmbed: boolean;
};

type TableViewWrapperProps = {
  isEmbed: boolean;
};

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 16px;

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

const TableContainer = styled.div`
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.grey};
  padding: 0 0 24px 0;

  p {
    margin: 0 0 4px 0;
  }
`;

const CityHeadingContainer = styled.div`
  padding: 0 16px;
`;

const BoldText = styled.p`
  font-weight: bold;
`;

const ItalicText = styled.p`
  font-style: italic;
`;

const CityHeading = styled.h2`
  font-size: 21px;
  margin: 18px 0 8px;
`;

const TableHead = styled.thead`
  background: ${props => props.theme.lightGrey};

  th {
    padding: 6px 4px;
    font-style: italic;
    font-size: 14px;
  }
`;

const TableViewWrapper = styled.div<TableViewWrapperProps>`
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 40px;
  height: ${props => (props.isEmbed ? `calc(100vh - (${CITYSELECTHEIGHT}px + ${NAVHEIGHT}px))` : 'auto')};
  overflow: ${props => (props.isEmbed ? 'auto' : 'initial')};
`;

const CityTables = ({ data, selectedCity, isEmbed }: CityTablesProps) => {
  const [listItems, setListItems] = useState(data.slice(0, 10));
  const [isFetching, setIsFetching] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const fetchMoreListItems = useCallback(() => {
    if (isFetching) return;
    setIsFetching(true);
    setListItems((prevState: any) => [...prevState, ...data.slice(prevState.length, prevState.length + 10)]);
    setIsFetching(false);
  }, [data, isFetching]);

  // For the main site, where the page is scrolled
  const handleWindowScroll = useCallback(() => {
    if (
      selectedCity !== '' ||
      data.length === listItems.length ||
      window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight
    )
      return;
    fetchMoreListItems();
  }, [selectedCity, data, fetchMoreListItems, listItems]);

  // For article embeds, where the the container is scrolled
  const handleContainerScroll = () => {
    if (isEmbed && container.current !== null && selectedCity === '' && data.length > listItems.length) {
      var scrollY = container.current.scrollHeight - container.current.scrollTop;
      var height = container.current.offsetHeight;
      var offset = height - scrollY;

      if (offset === 0 || offset === 1) {
        fetchMoreListItems();
      }
    }
  };

  useEffect(() => {
    const cityList =
      selectedCity === ''
        ? data
        : data.filter((item: any) => {
            return item.city === selectedCity;
          });
    setListItems(cityList.slice(0, 10));
  }, [data, selectedCity]);

  useEffect(() => {
    if (!isEmbed) {
      window.addEventListener('scroll', handleWindowScroll);
      return () => window.removeEventListener('scroll', handleWindowScroll);
    }
  }, [isEmbed, handleWindowScroll, listItems]);

  return (
    <TableViewWrapper isEmbed={isEmbed} ref={container} onScroll={handleContainerScroll}>
      {listItems.map((item: any) => {
        const formattedData = handleResponseData(item);

        return (
          <TableContainer key={item.city}>
            <CityHeadingContainer>
              <CityHeading>{item.city}</CityHeading>
              <BoldText>Vastauksia yhteensä {formattedData.responsesTotal}</BoldText>

              {formattedData.percentageOfPopulation != null ? (
                <ItalicText>{formattedData.percentageOfPopulation} % väkiluvusta</ItalicText>
              ) : null}
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
                  <td>{formattedData.suspicionPercentage != null ? `${formattedData.suspicionPercentage} %` : '-'}</td>
                </tr>
                <tr>
                  <th scope="row">Yskää</th>
                  <td>{formattedData.coughTotal}</td>
                  <td>{formattedData.coughPercentage != null ? `${formattedData.coughPercentage} %` : '-'}</td>
                </tr>
                <tr>
                  <th scope="row">Kuumetta</th>
                  <td>{formattedData.feverTotal}</td>
                  <td>{formattedData.feverPercentage != null ? `${formattedData.feverPercentage} %` : '-'}</td>
                </tr>
                <tr>
                  <th scope="row">Vaikeuksia hengittää</th>
                  <td>{formattedData.breathingDifficultiesTotal}</td>
                  <td>
                    {formattedData.breathingDifficultiesPercentage != null
                      ? `${formattedData.breathingDifficultiesPercentage} %`
                      : '-'}
                  </td>
                </tr>
              </tbody>
            </Table>
          </TableContainer>
        );
      })}
    </TableViewWrapper>
  );
};

export default CityTables;
