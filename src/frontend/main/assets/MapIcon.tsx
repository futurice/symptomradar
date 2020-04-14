import React from 'react';

type svgProps = {
  fillColor: string;
};

const AboutIcon = ({ fillColor }: svgProps) => {
  const pathFill = fillColor || '#000';

  return (
    <svg
      focusable="false"
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.667082 15.2619C0.522843 15.2619 0.382496 15.2151 0.267106 15.1285C0.184314 15.0664 0.117115 14.9859 0.070833 14.8934C0.0245507 14.8008 0.000455437 14.6987 0.000455437 14.5952V2.59596C-0.00507666 2.44634 0.0399218 2.29921 0.128201 2.17828C0.21648 2.05735 0.3429 1.96966 0.487092 1.92933L5.15348 0.596081C5.25185 0.568189 5.35533 0.563301 5.45589 0.581796C5.55646 0.600291 5.65142 0.641673 5.73344 0.702742C5.81994 0.767483 5.8894 0.852278 5.93585 0.949826C5.9823 1.04737 6.00435 1.15475 6.00009 1.26271V13.262C6.00562 13.4116 5.96062 13.5587 5.87234 13.6797C5.78406 13.8006 5.65765 13.8883 5.51345 13.9286L0.847071 15.2619C0.787467 15.2716 0.726685 15.2716 0.667082 15.2619ZM1.33371 3.09593V13.7086L4.66684 12.762V2.14932L1.33371 3.09593Z"
        fill={pathFill}
      />
      <path
        d="M10.6665 15.2619C10.4897 15.2619 10.3201 15.1916 10.1951 15.0666C10.0701 14.9416 9.99985 14.772 9.99985 14.5952V2.59596C9.99431 2.44634 10.0393 2.29921 10.1276 2.17828C10.2159 2.05735 10.3423 1.96966 10.4865 1.92933L15.1529 0.596081C15.2512 0.568189 15.3547 0.563301 15.4553 0.581796C15.5558 0.600291 15.6508 0.641673 15.7328 0.702742C15.8193 0.767483 15.8888 0.852278 15.9352 0.949826C15.9817 1.04737 16.0037 1.15475 15.9995 1.26271V13.262C16.005 13.4116 15.96 13.5587 15.8717 13.6797C15.7835 13.8006 15.657 13.8883 15.5128 13.9286L10.8465 15.2619C10.7869 15.2716 10.7261 15.2716 10.6665 15.2619ZM11.3331 3.09593V13.7086L14.6662 12.762V2.14932L11.3331 3.09593Z"
        fill={pathFill}
      />
      <path
        d="M10.6664 15.2619C10.6133 15.2683 10.5596 15.2683 10.5064 15.2619L5.17342 13.9286C5.02551 13.8922 4.89457 13.8061 4.80239 13.6848C4.71021 13.5635 4.66235 13.4143 4.66679 13.262V1.26275C4.66624 1.1615 4.68877 1.06145 4.73266 0.970199C4.77655 0.878949 4.84066 0.798897 4.9201 0.736119C4.99851 0.670345 5.091 0.623504 5.19042 0.599228C5.28984 0.574951 5.39351 0.573891 5.4934 0.596127L10.8264 1.92938C10.9743 1.96588 11.1053 2.05194 11.1974 2.17323C11.2896 2.29452 11.3375 2.44373 11.333 2.59601V14.5953C11.333 14.7721 11.2628 14.9416 11.1378 15.0667C11.0128 15.1917 10.8432 15.2619 10.6664 15.2619ZM6.00004 12.7421L9.9998 13.742V3.11597L6.00004 2.11603V12.7421Z"
        fill={pathFill}
      />
    </svg>
  );
};

export default AboutIcon;
