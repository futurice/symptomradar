import React from 'react';
import styled from 'styled-components';

const H2 = styled.h2`
  font-size: 21px;
  margin: 5px 0 16px;
  padding-bottom: 44px;
`;

const H3 = styled.h3`
  font-size: 16px;
  font-weight: normal;
`;

const TagGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const Tag = styled.div`
  background-color: #ffb7b7;
  display: inline-block;
  padding: 5px 25px;
  margin: 5px;
  height: 50px;
  border-radius: 100px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BlueTag = styled(Tag)`
  background-color: #b7e5ff;
`;

const Filters = () => {
  return (
    <div>
      <H2>Filter</H2>
      <H3>Symptoms</H3>
      <TagGroup>
        <Tag>Fever</Tag>
        <Tag>Coughing</Tag>
        <Tag>Fatigue</Tag>
        <Tag>Muscle pain</Tag>
        <Tag>Shortness of breath</Tag>
      </TagGroup>
      <H3>Age</H3>
      <TagGroup>
        <BlueTag>4-20</BlueTag>
        <BlueTag>20-25</BlueTag>
        <BlueTag>25-40</BlueTag>
        <BlueTag>40-60</BlueTag>
        <BlueTag>Over 60</BlueTag>
      </TagGroup>
    </div>
  );
};

export default Filters;
