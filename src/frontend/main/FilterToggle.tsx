import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
/* TODO add the icon if this component needed later */

// import filterIcon from './assets/filter-icon.svg';
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
  const { isShowing, toggleModal } = useModal();

  return (
    <>
      <FilterButton onClick={toggleModal}>Filter</FilterButton>
      <Modal isShowing={isShowing} hide={toggleModal}>
        <Filters />
      </Modal>
    </>
  );
};

export default FilterToggle;
