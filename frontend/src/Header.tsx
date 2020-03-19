import React from 'react';
import styled from 'styled-components';

const AppHeader = styled.header`
  height: 105px;
  padding: 0 24px;
  background-color: #fff;
`;

const H1 = styled.h1`
  font-size: 32px;
`;

function Header() {
  return (
    <AppHeader>
      <H1>Symptom radar</H1>
    </AppHeader>
  );
}

export default Header;
