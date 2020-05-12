import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { symptomLabels } from './constants';
import handleResponseData, { ResponseDataKey } from './handleResponseData';

type CityTablesProps = {
  data: any;
  selectedCity: string;
  isEmbed: boolean;
};

type TableViewWrapperProps = {
  readonly isEmbed: boolean;
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
      width: 145px;
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
  height: ${({ isEmbed, theme }) => (isEmbed ? `calc(100vh - ${theme.citySelectHeight + theme.navHeight}px)` : 'auto')};
  overflow: ${props => (props.isEmbed ? 'auto' : 'initial')};
`;

const CityTables = ({ data, selectedCity, isEmbed }: CityTablesProps) => {
  const [listItems, setListItems] = useState(data.slice(0, 10));
  const [isFetching, setIsFetching] = useState(false);
  const { t } = useTranslation(['main', 'format']);

  const container = useRef<HTMLDivElement>(null);

  const fetchMoreListItems = useCallback(() => {
    if (isFetching) return;
    setIsFetching(true);
    setListItems((prevState: any) => [...prevState, ...data.slice(prevState.length, prevState.length + 10)]);
    setIsFetching(false);
  }, [data, isFetching]);

  // For the main site, where the page is scrolled
  const handleWindowScroll = useCallback(() => {
    const scrollTop = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
    if (
      selectedCity !== '' ||
      data.length === listItems.length ||
      window.innerHeight + scrollTop + 40 < document.documentElement.offsetHeight
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

      if (offset > -40) {
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
              {formattedData.responsesTotal != null ? (
                <>
                  <BoldText>
                    {t('main:totalResponses')} {formattedData.responsesTotal}
                  </BoldText>
                  <ItalicText>
                    {t('format:percentage', { percentage: formattedData.percentageOfPopulation })}{' '}
                    {t('main:ofPopulation')}
                  </ItalicText>
                </>
              ) : (
                <p>{t('main:notEnoughResponses')}</p>
              )}
            </CityHeadingContainer>
            {formattedData.responsesTotal != null && (
              <Table>
                <TableHead>
                  <tr>
                    <th>{t('main:symptoms')}</th>
                    <th>{t('main:responses')}</th>
                    <th>{t('main:shareOfPopulation')}</th>
                  </tr>
                </TableHead>
                <tbody>
                  {(Object.keys(symptomLabels) as Array<keyof typeof symptomLabels>).map(key => {
                    const totalKey = `${key}Total` as ResponseDataKey;
                    const percentageKey = `${key}Percentage` as ResponseDataKey;
                    return (
                      <tr key={`symptom-row-${key}-${i18n.language}`}>
                        <th scope="row">{t(`symptomLabels:${symptomLabels[key]}`)}</th>
                        <td>{totalKey in formattedData && formattedData[totalKey]}</td>
                        <td>
                          {percentageKey in formattedData &&
                            `${t('format:percentage', { percentage: formattedData[percentageKey] })}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </TableContainer>
        );
      })}
    </TableViewWrapper>
  );
};

export default CityTables;
