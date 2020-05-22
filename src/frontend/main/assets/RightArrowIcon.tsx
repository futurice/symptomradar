import React from 'react';

type svgProps = {
  fillColor: string;
};

const RightArrowIcon = ({ fillColor }: svgProps) => {
  const pathFill = fillColor || '#000';

  return (
    <svg
      focusable="false"
      aria-hidden="true"
      width="8"
      height="13"
      viewBox="0 0 8 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.76845 12.7317L8 6.50011L1.76845 0.268555L0 2.037L4.46442 6.50011L0 10.9632L1.76845 12.7317Z"
        fill={pathFill}
      />
    </svg>
  );
};

export default RightArrowIcon;
