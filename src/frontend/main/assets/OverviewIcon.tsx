import React from 'react';

type svgProps = {
  fillColor: string;
};

const OverviewIcon = ({ fillColor }: svgProps) => {
  const pathFill = fillColor || '#000';

  return (
    <svg
      focusable="false"
      aria-hidden="true"
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.1722 1H1.55629C1.23841 1 1 1.23841 1 1.55629V10.9338C1 11.2517 1.23841 11.4901 1.55629 11.4901H10.9338C11.2517 11.4901 11.4901 11.2517 11.4901 10.9338V1.31788C11.4901 1.15894 11.3311 1 11.1722 1Z"
        stroke={pathFill}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.6622 1H16.0463C15.7284 1 15.49 1.23841 15.49 1.55629V10.9338C15.49 11.2517 15.7284 11.4901 16.0463 11.4901H25.4238C25.7416 11.4901 25.9801 11.2517 25.9801 10.9338V1.31788C25.9801 1.15894 25.8211 1 25.6622 1Z"
        stroke={pathFill}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1722 15.4902H1.55629C1.23841 15.4902 1 15.7286 1 16.0465V25.424C1 25.7419 1.23841 25.9803 1.55629 25.9803H10.9338C11.2517 25.9803 11.4901 25.7419 11.4901 25.424V15.8081C11.4901 15.6492 11.3311 15.4902 11.1722 15.4902Z"
        stroke={pathFill}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.6622 15.4902H16.0463C15.7284 15.4902 15.49 15.7286 15.49 16.0465V25.424C15.49 25.7419 15.7284 25.9803 16.0463 25.9803H25.4238C25.7416 25.9803 25.9801 25.7419 25.9801 25.424V15.8081C25.9801 15.6492 25.8211 15.4902 25.6622 15.4902Z"
        stroke={pathFill}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default OverviewIcon;
