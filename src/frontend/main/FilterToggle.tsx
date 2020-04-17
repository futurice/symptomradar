import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import FilterIcon from './assets/FilterIcon';
import PrimaryButton from './PrimaryButton';
import Filters from './Filters';
import useModal from './useModal';
import { FILTERS } from './constants';

type FilterToggleProps = {
  selectedFilter: keyof typeof FILTERS;
  handleFilterChange: (filterName: keyof typeof FILTERS) => void;
};

const FilterButton = styled(PrimaryButton)`
  padding: 5px 16px;
  display: flex;
  justify-content: center;
  margin-right: 8px;

  svg {
    padding-right: 4px;
    height: 18px;
  }
`;

const FilterToggle = ({ selectedFilter, handleFilterChange }: FilterToggleProps) => {
  const { isShowing, toggleModal } = useModal();

  return (
    <>
      <FilterButton type="button" handleClick={toggleModal} label="Rajaa">
        <FilterIcon />
      </FilterButton>
      <Modal isShowing={isShowing} hide={toggleModal}>
        <Filters selectedFilter={selectedFilter} hide={toggleModal} handleFilterChange={handleFilterChange} />
      </Modal>
    </>
  );
};

export default FilterToggle;
