import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
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

  & span {
    border-left: 1px solid ${props => props.theme.grey};
  }

  &:last-child span {
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
  line-height: 1.1;
  padding: 0 10px;
  text-align: center;
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
  const mapPath = isEmbed ? '/map-embed/map' : '/map';
  const { t } = useTranslation(['main']);

  return (
    <>
      <SubNavContainer>
        <Match path={mapPath}>
          {({ match }) => (
            <RouterLink to={mapPath}>
              <SubNavLink isActive={match ? true : false} isEmbed={isEmbed}>
                {t('main:allOfFinland')}
              </SubNavLink>
            </RouterLink>
          )}
        </Match>
        <Match path="cities">
          {({ match }) => (
            <RouterLink to="cities">
              <SubNavLink isActive={match ? true : false} isEmbed={isEmbed}>
                {t('main:chooseMunicipality')}
              </SubNavLink>
            </RouterLink>
          )}
        </Match>
      </SubNavContainer>
    </>
  );
};

export default SubNav;
