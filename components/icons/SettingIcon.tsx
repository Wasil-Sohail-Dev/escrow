import React from "react";

interface SettingIconProps {
  className?: string;
}

const SettingIcon = ({ className }: SettingIconProps) => {
  return (
    <svg 
      width="22" 
      height="24" 
      viewBox="0 0 22 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M20.7642 13.9755C21.17 14.1911 21.4831 14.5315 21.7034 14.8719C22.1324 15.5753 22.0976 16.4376 21.6802 17.1978L20.8685 18.5594C20.4395 19.2855 19.6394 19.7394 18.8162 19.7394C18.4103 19.7394 17.9581 19.6259 17.5871 19.399C17.2856 19.2061 16.9377 19.138 16.5667 19.138C15.4188 19.138 14.4563 20.0797 14.4216 21.203C14.4216 22.5078 13.3548 23.529 12.0213 23.529H10.4444C9.09932 23.529 8.03256 22.5078 8.03256 21.203C8.00937 20.0797 7.04696 19.138 5.89902 19.138C5.51638 19.138 5.16852 19.2061 4.87864 19.399C4.50759 19.6259 4.04378 19.7394 3.64954 19.7394C2.81468 19.7394 2.0146 19.2855 1.58558 18.5594L0.785504 17.1978C0.356478 16.4603 0.333288 15.5753 0.762313 14.8719C0.947838 14.5315 1.2957 14.1911 1.68994 13.9755C2.0146 13.8167 2.22332 13.5557 2.42044 13.2494C3.0002 12.2736 2.65234 10.9915 1.66675 10.4128C0.518812 9.76609 0.147763 8.32513 0.808694 7.20186L1.58558 5.86302C2.25811 4.73975 3.69592 4.34263 4.85545 5.00071C5.86424 5.54532 7.17451 5.18225 7.76587 4.21782C7.95139 3.90013 8.05575 3.55975 8.03256 3.21936C8.00937 2.77686 8.13692 2.35705 8.35723 2.01667C8.78625 1.31321 9.56314 0.859362 10.4096 0.83667H12.0445C12.9026 0.83667 13.6795 1.31321 14.1085 2.01667C14.3172 2.35705 14.4563 2.77686 14.4216 3.21936C14.3984 3.55975 14.5027 3.90013 14.6883 4.21782C15.2796 5.18225 16.5899 5.54532 17.6103 5.00071C18.7582 4.34263 20.2076 4.73975 20.8685 5.86302L21.6454 7.20186C22.3179 8.32513 21.9469 9.76609 20.7874 10.4128C19.8018 10.9915 19.4539 12.2736 20.0453 13.2494C20.2308 13.5557 20.4395 13.8167 20.7642 13.9755ZM7.95139 12.194C7.95139 13.9754 9.42399 15.3937 11.2445 15.3937C13.0649 15.3937 14.5027 13.9754 14.5027 12.194C14.5027 10.4127 13.0649 8.98308 11.2445 8.98308C9.42399 8.98308 7.95139 10.4127 7.95139 12.194Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default SettingIcon; 