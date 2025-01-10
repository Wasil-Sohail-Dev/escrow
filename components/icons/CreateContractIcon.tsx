import React from "react";

interface CreateContractIconProps {
  className?: string;
}

const CreateContractIcon = ({ className }: CreateContractIconProps) => {
  return (
    <svg 
      width="28" 
      height="29" 
      viewBox="0 0 28 29" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M25.3131 3.43392C25.2063 3.31685 25.0769 3.22261 24.9327 3.15691C24.7885 3.0912 24.6324 3.05538 24.474 3.0516C24.3156 3.04783 24.158 3.07617 24.0108 3.13493C23.8636 3.19369 23.7299 3.28165 23.6176 3.3935L22.6438 4.36413L24.3021 6.01818L25.2594 5.06564C25.4773 4.8532 25.6045 4.56472 25.6146 4.26059C25.6246 3.95645 25.5166 3.66023 25.3131 3.43392ZM14.0586 18.6874H9.97615V14.6049L10.4761 14.106L17.8231 6.77394H3.16846V25.4951H21.8896V10.8405L14.5575 18.1875L14.0586 18.6874ZM21.8896 8.43119L23.6336 6.68353L21.98 5.03L20.2329 6.77394H21.8896V8.43119Z" 
        fill="currentColor"
      />
      <path 
        d="M11.678 16.9855H13.3528L21.8895 8.43117V6.77393H20.2328L11.678 15.3107V16.9855Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default CreateContractIcon; 