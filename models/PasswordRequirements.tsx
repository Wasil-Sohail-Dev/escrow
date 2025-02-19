import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  text: string;
  isMet: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showRequirements
}) => {
  const requirements: PasswordRequirement[] = [
    {
      text: "At least 8 characters",
      isMet: password.length >= 8
    },
    {
      text: "At least one lowercase letter",
      isMet: /[a-z]/.test(password)
    },
    {
      text: "At least one uppercase letter",
      isMet: /[A-Z]/.test(password)
    },
    {
      text: "At least one number",
      isMet: /\d/.test(password)
    },
    {
      text: "At least one special character",
      isMet: /[@$!%*?&]/.test(password)
    }
  ];

  if (!showRequirements) return null;

  return (
    <div className="absolute left-0 md:left-[105%] bottom-0 md:bottom-auto md:top-0 w-full md:w-72 translate-y-full md:translate-y-0 bg-white dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg p-4 shadow-lg z-10">
      {/* Arrow for desktop */}
      <div className="hidden md:block absolute left-0 top-4 -translate-x-2">
        <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white dark:border-r-dark-input-bg"></div>
      </div>
      {/* Arrow for mobile */}
      <div className="md:hidden absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-dark-input-bg"></div>
      </div>
      
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2">
            {requirement.isMet ? (
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#00BA88]">
                <Check className="w-3 h-3" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-red-500">
                <X className="w-3 h-3" />
              </div>
            )}
            <span className={`text-sm ${requirement.isMet ? 'text-[#00BA88]' : 'text-gray-500 dark:text-dark-text/60'}`}>
              {requirement.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements; 