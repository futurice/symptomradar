import React from 'react';
import styled from 'styled-components';

type ButtonProps = {
  label: string;
  type?: any;
};

const Wrapper = styled.div`
  text-align: center;
`;

const Button = styled.button`
  height: 50px;
  padding: 5px 25px;
  background: #75af59;
  border-radius: 100px;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
`;

const PrimaryButton = ({ type, label }: ButtonProps) => {
  return (
    <Wrapper>
      <Button type={type}>{label}</Button>
    </Wrapper>
  );
};

export default PrimaryButton;
