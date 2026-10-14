import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#eaedf0] flex items-center justify-center sm:py-6 sm:px-4">
      {/* 
        On PC (>= 600px): Fixed 390x844 smartphone shell with rounded corners and notch.
        On mobile (< 600px): App expands to full screen width & height with safe area consideration.
      */}
      <div className="w-full sm:w-[390px] h-screen sm:h-[844px] bg-white sm:rounded-[50px] sm:border-[10px] sm:border-[#1A202C] sm:shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col">
        {/* Dynamic Island / Top Notch (only on simulated frame) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A202C] rounded-b-2xl z-50 pointer-events-none flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#0d1117] mr-3" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#161c24]" />
        </div>

        {/* Inner App Screen Area */}
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#16233B]">
          {children}
        </div>
      </div>
    </div>
  );
};
