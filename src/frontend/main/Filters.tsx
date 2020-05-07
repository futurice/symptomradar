import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PrimaryButton from './PrimaryButton';
import { FILTERS } from './constants';

type FilterProps = {
  hide: () => void;
  selectedFilter: keyof typeof FILTERS;
  handleFilterChange: (filterName: keyof typeof FILTERS) => void;
};

type FilterKey = keyof typeof FILTERS;

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
  const { t } = useTranslation('mapView');

  const applyFilters = () => {
    handleFilterChange(activeFilter);
    hide();
  };
  return (
    <div>
      <H2>{t('filterDialogTitle')}</H2>
      <H3>{t('symptoms')}</H3>
      <TagGroup>
        {Object.keys(FILTERS).map(key => {
          return (
            <Tag
              key={key}
              type="button"
              label={FILTERS[key as FilterKey].label}
              isActive={activeFilter === FILTERS[key as FilterKey].id ? true : false}
              handleClick={() => {
                setActiveFilter(FILTERS[key as FilterKey].id as FilterKey);
              }}
            ></Tag>
          );
        })}
      </TagGroup>
      <ButtonWrapper>
        <ActionButton type="button" label="Rajaa vastauksia" handleClick={applyFilters} />
      </ButtonWrapper>
    </div>
  );
};

export default Filters;
