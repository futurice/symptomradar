import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import FilterToggle from '../FilterToggle';
import PrimaryButton from '../PrimaryButton';
import MapContainer from './MapContainer';
import CloseIcon from '../assets/CloseIcon';
import { FILTERS, theme } from '../constants';
import { getLocaleDateMonth, getCurrentLocale } from '../translations';
import { RouteComponentProps } from '@reach/router';

type FilterKey = keyof typeof FILTERS;

interface MapViewProps extends RouteComponentProps {
  isEmbed: boolean;
  dataForMap: any;
  lastUpdated: Date;
  totalResponses: number;
}

type FilterWrapperProps = {
  isEmbed: boolean;
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const MapWrapper = styled.div`
  text-align: center;
  position: relative;
  height: calc(100vh - ${({ theme }) => theme.headerHeight + theme.navHeight}px);
`;

const FilterWrapper = styled.div<FilterWrapperProps>`
  position: absolute;
  top: 10px;
  padding: ${props => (props.isEmbed ? '3px' : '3px 16px')};
  display: flex;

  @media (min-width: ${({ theme }) => `${theme.mobileWidth}px`}) {
    padding-left: 0;
  }
`;

const ActiveFilter = styled(PrimaryButton)`
  background: ${props => props.theme.grey};
  color: ${props => props.theme.white};
  border: none;
  pointer-events: none;
`;

const MapInfo = styled.div<{ topBorder?: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100vw;
  background: ${props => props.theme.white};
  text-align: left;
  border-top: ${({ topBorder, theme }) => (topBorder ? `1px solid ${theme.black}` : 'none')};
  line-height: 1.25;

  p {
    margin: 5px 0;
  }
`;

const MapInfoContent = styled(Container)`
  padding: 6px 34px 0px 16px;
  position: relative;

  p:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${({ theme }) => `${theme.mobileWidth}px`}) {
    padding-left: 0;
  }
`;

const CloseButton = styled.button`
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  padding: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LastUpdated = styled(Container)`
  padding: 10px 16px 10px 16px;
  font-style: italic;
  font-size: 14px;
  @media (min-width: ${({ theme }) => `${theme.mobileWidth}px`}) {
    padding-left: 0;
  }
`;

const MapView = (props: MapViewProps) => {
  const [showMapInfo, setShowMapInfo] = useState(true);
  const { t } = useTranslation(['symptomLabels', 'main']);
  const { navHeight, headerHeight } = theme;
  const topPartHeight = props.isEmbed ? navHeight : headerHeight + navHeight;
  const currentLocale = getCurrentLocale();

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(FILTERS.corona_suspicion_yes.id as FilterKey);
  const [mapHeight, setMapHeight] = useState(window.innerHeight - topPartHeight - 10);

  const handleFilterChange = (filterName: string) => {
    setSelectedFilter(filterName as FilterKey);
  };

  useEffect(() => {
    const resizeHandler = () => {
      setMapHeight(window.innerHeight - topPartHeight - 10);
    };
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [topPartHeight]);

  return (
    <MapWrapper>
      <MapContainer
        mapShapeData={props.dataForMap}
        selectedFilter={selectedFilter}
        mapHeight={mapHeight}
        popUpOpen={showMapInfo}
      />
      <Container>
        <FilterWrapper isEmbed={props.isEmbed}>
          <FilterToggle selectedFilter={selectedFilter} handleFilterChange={handleFilterChange} />
          <ActiveFilter type="button" label={t(`symptomLabels:${FILTERS[selectedFilter].label}`)}></ActiveFilter>
        </FilterWrapper>
      </Container>
      <MapInfo topBorder={showMapInfo}>
        {showMapInfo && (
          <>
            <MapInfoContent className="popUp">
              <CloseButton
                type="button"
                data-dismiss="modal"
                aria-label={t('main:close')}
                onClick={() => setShowMapInfo(false)}
              >
                <CloseIcon />
              </CloseButton>
              <Trans i18nKey="main:mapInfo" t={t}>
                <p>
                  Kartta näyttää, millaisia oireita vastaajilla on eri kunnissa. Mukana ovat kunnat, joista on saatu yli
                  25 vastausta.
                </p>
                <p>Kuntien vastauksiin voi tutustua klikkaamalla palloja tai käyttämällä hakuvalikkoa.</p>
              </Trans>
            </MapInfoContent>
          </>
        )}
        <LastUpdated>
          {t('main:totalResponses')}: {props.totalResponses.toLocaleString(currentLocale)} ({t('main:lastUpdated')}:{' '}
          {getLocaleDateMonth(props.lastUpdated)})
        </LastUpdated>
      </MapInfo>
    </MapWrapper>
  );
};

export default MapView;
