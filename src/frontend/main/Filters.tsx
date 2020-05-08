import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PrimaryButton from './PrimaryButton';
import { FILTERS } from './constants';

type FilterProps = {
  hide: () => void;
  selectedFilter: FILTERS;
  handleFilterChange: (filterName: FILTERS) => void;
};

const H3 = styled.h3`
  font-size: 16px;
  font-weight: normal;
`;

const TagGroup = styled.div`
  margin-bottom: 10px;
  padding-left: 16px;
`;

const Tag = styled(PrimaryButton)`
  margin: 0 8px 16px 0;
  background: ${props => (props.isActive ? props.theme.grey : props.theme.white)};
  color: ${props => (props.isActive ? props.theme.white : props.theme.black)};
  border: ${props => (props.isActive ? '1px solid transparent' : `1px solid ${props.theme.black}`)};
`;

const H2 = styled.h2`
  font-size: 21px;
  margin: 0 0 24px 0;
`;

const ButtonWrapper = styled.div`
  margin-top: 35px;
`;

const ActionButton = styled(PrimaryButton)`
  display: block;
  margin: 40px auto 0 auto;
  min-width: 135px;
  background: ${props => props.theme.green};
  color: ${props => props.theme.white};
  border: none;
`;

const Filters = ({ hide, selectedFilter, handleFilterChange }: FilterProps) => {
  const [activeFilter, setActiveFilter] = useState(selectedFilter);
  const { t } = useTranslation(['mapView', 'symptomLabels']);

  const applyFilters = () => {
    handleFilterChange(activeFilter);
    hide();
  };
  return (
    <div>
      <H2>{t('mapView:filterDialogTitle')}</H2>
      <H3>{t('mapView:symptoms')}</H3>
      <TagGroup>
        {Object.keys(FILTERS).map(symptomId => {
          return (
            <Tag
              key={symptomId}
              type="button"
              label={t(`symptomLabels:${symptomId}`)}
              isActive={activeFilter === symptomId ? true : false}
              handleClick={() => {
                setActiveFilter(symptomId as FILTERS);
              }}
            ></Tag>
          );
        })}
      </TagGroup>
      <ButtonWrapper>
        <ActionButton type="button" label={t('mapView:filterResponses')} handleClick={applyFilters} />
      </ButtonWrapper>
    </div>
  );
};

export default Filters;
