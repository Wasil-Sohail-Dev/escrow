import React from "react";

interface ContactDetailIconProps {
  className?: string;
}

const ContactDetailIcon = ({ className }: ContactDetailIconProps) => {
  return (
    <svg 
      width="21" 
      height="26" 
      viewBox="0 0 21 26" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_744_3698" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="26">
        <path d="M18.173 1.66333H2.28842C1.98751 1.66333 1.69891 1.78287 1.48613 1.99565C1.27335 2.20843 1.15381 2.49703 1.15381 2.79795V23.221C1.15381 23.5219 1.27335 23.8105 1.48613 24.0233C1.69891 24.2361 1.98751 24.3556 2.28842 24.3556H18.173C18.474 24.3556 18.7626 24.2361 18.9753 24.0233C19.1881 23.8105 19.3077 23.5219 19.3077 23.221V2.79795C19.3077 2.49703 19.1881 2.20843 18.9753 1.99565C18.7626 1.78287 18.474 1.66333 18.173 1.66333Z" fill="white" stroke="white" strokeWidth="2.26923" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.69214 16.4133H13.6344M5.69214 19.8172H9.66329" stroke="black" strokeWidth="2.26923" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.69214 6.20166H13.6344V11.8747H5.69214V6.20166Z" fill="white" stroke="black" strokeWidth="2.26923" strokeLinecap="round" strokeLinejoin="round"/>
      </mask>
      <g mask="url(#mask0_744_3698)">
        <path d="M-3.9519 -0.605957H23.2789V26.6248H-3.9519V-0.605957Z" fill="currentColor"/>
      </g>
    </svg>
  );
};

export default ContactDetailIcon;
