import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import FilterIcon from './assets/FilterIcon';
import PrimaryButton from './PrimaryButton';
import Filters, { CompareFilters } from './Filters';
import useModal from './useModal';
import { FilterKey, Symptom } from './constants';

type FilterToggleProps = {
  selectedFilter: FilterKey;
  handleFilterChange: (filterName: FilterKey) => void;
};

const FilterButton = styled(PrimaryButton)`
  padding: 5px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;

  svg {
    padding-right: 4px;
    height: 18px;
  }
`;

const FilterToggle = ({ selectedFilter, handleFilterChange }: FilterToggleProps) => {
  const { isShowing, toggleModal } = useModal();
  const { t } = useTranslation(['main']);

  return (
    <>
      <FilterButton type="button" handleClick={toggleModal} label={t('main:filter')}>
        <FilterIcon />
      </FilterButton>
      <Modal isShowing={isShowing} hide={toggleModal} ariaLabel={t('main:filterDialogTitle')}>
        <Filters selectedFilter={selectedFilter} hide={toggleModal} handleFilterChange={handleFilterChange} />
      </Modal>
    </>
  );
};

export default FilterToggle;

type CompareFilterToggleProps = {
  firstSelectedFilter: Symptom;
  secondSelectedFilter: Symptom;
  handleFilterChange: (firstFilter: Symptom, secondFilter: Symptom) => void;
};

export const CompareFilterToggle = ({
  firstSelectedFilter,
  secondSelectedFilter,
  handleFilterChange,
}: CompareFilterToggleProps) => {
  const { isShowing, toggleModal } = useModal();
  const { t } = useTranslation(['main']);

  return (
    <>
      <FilterButton type="button" handleClick={toggleModal} label={t('main:filter')}>
        <FilterIcon />
      </FilterButton>
      <Modal isShowing={isShowing} hide={toggleModal} ariaLabel={t('main:filterDialogTitle')}>
        <CompareFilters
          firstSelectedFilter={firstSelectedFilter}
          secondSelectedFilter={secondSelectedFilter}
          hide={toggleModal}
          handleFilterChange={handleFilterChange}
        />
      </Modal>
    </>
  );
};
