import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import filterIcon from './assets/filter-icon.svg';
import Filters from './Filters';
import useModal from './useModal';

const FilterButton = styled.button`
  font-size: 16px;
  font-weight: bold;
  border: none;
  background-color: transparent;
  position: relative;
  padding: 5px 5px 5px 25px;
  background-repeat: no-repeat;
  background-position: center left;
`;

const FilterToggle = () => {
  const { isShowing, toggle } = useModal();

  return (
    <>
      <FilterButton onClick={toggle} style={{ backgroundImage: `url(${filterIcon})` }}>
        Filter
      </FilterButton>
      <Modal isShowing={isShowing} hide={toggle} modalTitle={'Filter'}>
        <Filters />
      </Modal>
    </>
  );
};

export default FilterToggle;
