import React, { useState } from 'react';
import styled from 'styled-components';
import PrimaryButton from './PrimaryButton';
import { FILTERS } from './constants';

type FilterProps = {
  hide: () => void;
  selectedFilter: string;
  handleFilterChange: (filterName: string) => void;
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
`;

const Filters = ({ hide, selectedFilter, handleFilterChange }: FilterProps) => {
  const [activeFilter, setActiveFilter] = useState(selectedFilter);

  const applyFilters = () => {
    handleFilterChange(activeFilter);
    hide();
  };
  return (
    <div>
      <H2>Rajaa tuloksia</H2>
      <H3>Oireet</H3>
      <TagGroup>
        <Tag
          type="button"
          label={FILTERS.corona_suspicion_yes.label}
          isActive={activeFilter === FILTERS.corona_suspicion_yes.id ? true : false}
          handleClick={() => {
            setActiveFilter(FILTERS.corona_suspicion_yes.id);
          }}
        ></Tag>
        <Tag
          type="button"
          label={FILTERS.cough_yes.label}
          isActive={activeFilter === FILTERS.cough_yes.id ? true : false}
          handleClick={() => {
            setActiveFilter(FILTERS.cough_yes.id);
          }}
        ></Tag>
        <Tag
          type="button"
          label={FILTERS.fever_yes.label}
          isActive={activeFilter === FILTERS.fever_yes.id ? true : false}
          handleClick={() => {
            setActiveFilter(FILTERS.fever_yes.id);
          }}
        ></Tag>
        <Tag
          type="button"
          label={FILTERS.breathing_difficulties_yes.label}
          isActive={activeFilter === FILTERS.breathing_difficulties_yes.id ? true : false}
          handleClick={() => {
            setActiveFilter(FILTERS.breathing_difficulties_yes.id);
          }}
        ></Tag>
      </TagGroup>
      <ButtonWrapper>
        <ActionButton type="button" label="Rajaa tuloksia" handleClick={applyFilters} />
      </ButtonWrapper>
    </div>
  );
};

export default Filters;
