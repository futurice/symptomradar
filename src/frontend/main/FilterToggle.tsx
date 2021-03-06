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
  isEmbed: boolean;
};

export const CompareFilterToggle = ({
  firstSelectedFilter,
  secondSelectedFilter,
  handleFilterChange,
  isEmbed,
}: CompareFilterToggleProps) => {
  const { isShowing, toggleModal } = useModal();
  const { t } = useTranslation(['main']);

  return (
    <>
      <FilterButton type="button" handleClick={toggleModal} label={t('main:filter')}>
        <FilterIcon />
      </FilterButton>
      {/* In case of embedded iframe, we havea very long overview page, and the modal
       * will be centerred to the iframe's height, but not with respect to the device's
       * screen sizes. That means there will be cases where the modal appear on top of
       * the screen while in embed. So placing the modal at the bottom of the iframe seems
       * to be a more ideal location.
       * */}
      <Modal isShowing={isShowing} hide={toggleModal} ariaLabel={t('main:filterDialogTitle')} positionBottom={isEmbed}>
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
