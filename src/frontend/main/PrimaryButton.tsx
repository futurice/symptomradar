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
  height: 35px;
  padding: 5px 16px;
  background: ${props => props.theme.white};
  border-radius: 100px;
  font-weight: bold;
  font-size: 16px;
  color: ${props => props.theme.black};
  border: 1px solid ${props => props.theme.black};
  cursor: pointer;
`;

const PrimaryButton: React.FC<ButtonProps> = ({ type, label, className, handleClick, isActive, children }) => {
  return (
    <Button type={type} className={className} onClick={handleClick} aria-pressed={isActive}>
      {children}
      {label}
    </Button>
  );
};

export default PrimaryButton;
