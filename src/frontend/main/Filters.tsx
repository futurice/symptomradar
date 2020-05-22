import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PrimaryButton from './PrimaryButton';
import { Symptom, FILTERS, FilterKey } from './constants';

type FilterProps = {
  hide: () => void;
  selectedFilter: FilterKey;
  handleFilterChange: (filterName: FilterKey) => void;
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
  const { t } = useTranslation(['main', 'symptomLabels']);

  const applyFilters = () => {
    handleFilterChange(activeFilter);
    hide();
  };
  return (
    <div>
      <H2>{t('main:filterDialogTitle')}</H2>
      <H3>{t('main:symptoms')}</H3>
      <TagGroup>
        {Object.keys(FILTERS).map(symptomId => {
          return (
            <Tag
              key={symptomId}
              type="button"
              label={t(`symptomLabels:${FILTERS[symptomId as FilterKey].label}`)}
              isActive={activeFilter === symptomId ? true : false}
              handleClick={() => {
                setActiveFilter(symptomId as FilterKey);
              }}
            ></Tag>
          );
        })}
      </TagGroup>
      <ButtonWrapper>
        <ActionButton type="button" label={t('main:filterResponses')} handleClick={applyFilters} />
      </ButtonWrapper>
    </div>
  );
};

export default Filters;

type CompareFilterProps = {
  hide: () => void;
  firstSelectedFilter: Symptom;
  secondSelectedFilter: Symptom;
  handleFilterChange: (firstFilter: Symptom, secondFilter: Symptom) => void;
};

// CompareFilters allows selecting 2 symptoms for stat comparison
export const CompareFilters = ({
  hide,
  firstSelectedFilter,
  secondSelectedFilter,
  handleFilterChange,
}: CompareFilterProps) => {
  const [firstActiveFilter, setFirstActiveFilter] = useState<Symptom>(firstSelectedFilter);
  const [secondActiveFilter, setSecondActiveFilter] = useState<Symptom>(secondSelectedFilter);
  const { t } = useTranslation(['main', 'symptomLabels']);

  const applyFilters = () => {
    handleFilterChange(firstActiveFilter, secondActiveFilter);
    hide();
  };
  return (
    <div>
      <H2>{t('main:filterDialogTitle')}</H2>
      <H3>{t('main:symptoms')}</H3>
      <TagGroup>
        {Object.values(Symptom).map(symptomId => {
          const isActive = symptomId === firstActiveFilter || symptomId === secondActiveFilter;
          return (
            <Tag
              key={symptomId}
              type="button"
              label={t(`symptomLabels:${symptomId}`)}
              isActive={isActive}
              handleClick={() => {
                if (!isActive) {
                  setFirstActiveFilter(secondActiveFilter);
                  setSecondActiveFilter(symptomId);
                }
              }}
            ></Tag>
          );
        })}
      </TagGroup>
      <ButtonWrapper>
        <ActionButton type="button" label={t('main:filterResponses')} handleClick={applyFilters} />
      </ButtonWrapper>
    </div>
  );
};
