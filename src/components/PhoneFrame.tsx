import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#eaedf0] flex items-center justify-center sm:p-6 overflow-hidden">
      {/* 
        On PC (>= 600px): Fixed 390x844 smartphone shell with rounded corners and notch.
        On mobile (< 600px): App fills entire screen with 100dvh, no borders.
      */}
      <div className="w-full sm:w-[390px] h-[100dvh] sm:h-[844px] sm:max-h-[844px] bg-[#16233B] sm:rounded-[50px] sm:border-[10px] sm:border-[#1A202C] sm:shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col">
        {/* Dynamic Island / Top Notch (only shown in PC simulated frame) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A202C] rounded-b-2xl z-50 pointer-events-none flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#0d1117] mr-3" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#161c24]" />
        </div>

        {/* Inner App Container with 3-tier layout */}
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#16233B] relative">
          {children}
        </div>
      </div>
    </div>
  );
};
