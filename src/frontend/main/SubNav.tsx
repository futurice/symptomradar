import React from 'react';
import styled from 'styled-components';
import { Link, Match } from '@reach/router';

type SubNavProps = {
  isEmbed: boolean;
};

interface SubNavLinkProps {
  readonly isEmbed: boolean;
  readonly isActive: boolean;
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const SubNavContainer = styled(Container)`
  height: ${props => props.theme.navHeight}px;
  border-bottom: 1px solid ${props => props.theme.grey};
  display: flex;
`;

const RouterLink = styled(Link)`
  width: 50%;
  display: flex;
  text-decoration: none;

  &:nth-child(1) span {
    border-left: 1px solid ${props => props.theme.grey};
  }

  &:nth-child(2) span {
    border-right: 1px solid ${props => props.theme.grey};
  }
`;

const SubNavLink = styled.span<SubNavLinkProps>`
  width: 100%;
  background: ${props => (props.isActive ? props.theme.grey : props.theme.white)};
  color: ${props => (props.isActive ? props.theme.white : props.theme.black)};
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: ${props => (props.isEmbed ? `1px solid ${props.theme.grey}` : 'none')};
  /* 
  The borders are first defined in the parent element (RouterLink) and overriden here in specific cases
  because for some reason the router Link element didn't accept isActive and isEmbed as props.
  Ideally all styles would be on the Link and not a span inside of it.
  */
  border-color: ${props => (props.isEmbed ? props.theme.grey : 'transparent')} !important;

  @media (min-width: 600px) {
    border-color: ${props => props.theme.grey} !important;
  }
`;

const SubNav = ({ isEmbed }: SubNavProps) => {
  console.log(isEmbed);
  const mapPath = isEmbed ? '/map-embed' : '/';
  console.log(mapPath);

  return (
    <>
      <SubNavContainer>
        <Match path={mapPath}>
          {({ match }) => (
            <RouterLink to={mapPath}>
              <SubNavLink isActive={match ? true : false} isEmbed={isEmbed}>
                Koko Suomi
              </SubNavLink>
            </RouterLink>
          )}
        </Match>
        <Match path="dashboard">
          {({ match }) => (
            <RouterLink to="dashboard">
              <SubNavLink isActive={match ? true : false} isEmbed={isEmbed}>
                Valitse kunta
              </SubNavLink>
            </RouterLink>
          )}
        </Match>
      </SubNavContainer>
    </>
  );
};

export default SubNav;
