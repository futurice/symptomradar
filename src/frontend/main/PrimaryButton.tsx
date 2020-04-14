import React from 'react';
import styled from 'styled-components';

type ButtonProps = {
  label: string;
  className?: string;
  type: 'submit' | 'button';
  handleClick?: any;
  isActive?: boolean;
};

const Button = styled.button`
  height: 50px;
  padding: 5px 25px;
  background: #fff;
  border-radius: 100px;
  font-weight: bold;
  font-size: 16px;
  color: #000;
  border: 1px solid #000;
  cursor: pointer;
`;

const PrimaryButton = ({ type, label, className, handleClick, isActive }: ButtonProps) => {
  return (
    <Button type={type} className={className} onClick={handleClick} aria-pressed={isActive}>
      {label}
    </Button>
  );
};

export default PrimaryButton;
