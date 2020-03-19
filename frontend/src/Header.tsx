import React from 'react';
import styled from 'styled-components';

const AppHeader = styled.header`
  height: 105px;
  padding: 0 24px;
  background-color: #fff;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const H1 = styled.h1`
  font-size: 32px;
  margin: 16px 0;
`;

const Select = styled.select`
  margin: 26px 0;
`;
function Header() {
  return (
    <AppHeader>
      <HeaderWrapper>
      <H1>Symptom radar</H1>
        <Select name="language" id="">
          <option value="Fi">Fi</option>
          <option value="En">En</option>
        </Select>
      </HeaderWrapper>
    </AppHeader>
  );
}

export default Header;
