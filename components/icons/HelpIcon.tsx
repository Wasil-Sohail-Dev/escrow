import React from "react";

interface HelpIconProps {
  className?: string;
}

const HelpIcon = ({ className }: HelpIconProps) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18.75C11.59 18.75 11.25 18.41 11.25 18C11.25 17.59 11.59 17.25 12 17.25C12.41 17.25 12.75 17.59 12.75 18C12.75 18.41 12.41 18.75 12 18.75ZM13.5 13.5C13.5 14.33 12.83 15 12 15C11.17 15 10.5 14.33 10.5 13.5V9C10.5 8.17 11.17 7.5 12 7.5C12.83 7.5 13.5 8.17 13.5 9V13.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default HelpIcon; 