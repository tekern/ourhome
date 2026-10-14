import React, { useState } from 'react';
import { CcpTask } from '../types';
import { QrCode, Check, MapPin, ScanLine } from 'lucide-react';

interface QrScanScreenProps {
  task: CcpTask;
  onScanComplete: () => void;
}

export const QrScanScreen: React.FC<QrScanScreenProps> = ({ task, onScanComplete }) => {
  const [isScanned, setIsScanned] = useState(false);
  const [isScanningAnim, setIsScanningAnim] = useState(false);

  const handleSimulateScan = () => {
    setIsScanningAnim(true);
    setTimeout(() => {
      setIsScanningAnim(false);
      setIsScanned(true);
    }, 300);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col justify-around">
        {/* Header Information */}
        <div className="bg-white rounded-[16px] p-4 text-center border border-[#E8F0FE]">
          <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-0.5 rounded-[8px] mb-1">
            <MapPin className="w-4 h-4" />
            <span>점검할 곳</span>
          </div>
          <h2 className="text-[20px] font-bold text-[#1B2333] mt-1">
            {task.title}
          </h2>
          <p className="text-[14px] font-medium text-[#6B7690] mt-0.5">
            {task.locationName}
          </p>
        </div>

        {/* QR Viewfinder Area */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 bg-white rounded-[20px] border-2 border-[#E8F0FE] flex flex-col items-center justify-center overflow-hidden">
            {/* Corner Guides in Main Blue #2B6BF3 */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-3 border-l-3 border-[#2B6BF3] rounded-tl-[8px]" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-3 border-r-3 border-[#2B6BF3] rounded-tr-[8px]" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-3 border-l-3 border-[#2B6BF3] rounded-bl-[8px]" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-3 border-r-3 border-[#2B6BF3] rounded-br-[8px]" />

            {/* Scan Line */}
            {isScanningAnim && (
              <div className="absolute left-0 right-0 h-1 bg-[#2B6BF3] animate-bounce top-1/2 -translate-y-1/2" />
            )}

            {isScanned ? (
              <div className="flex flex-col items-center text-center p-4 z-10 animate-check-pop">
                <div className="w-14 h-14 rounded-full bg-[#E8F0FE] text-[#2B6BF3] flex items-center justify-center mb-2">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>
                <span className="text-[#2B6BF3] font-bold text-[17px]">확인되었어요</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4 z-10">
                <QrCode className="w-16 h-16 text-[#BCD0F7] mb-2 stroke-[1.5]" />
                <span className="text-[#6B7690] font-medium text-[14px]">
                  QR 코드를 비춰주세요
                </span>
              </div>
            )}
          </div>

          {/* Status Note */}
          <div className="mt-3 text-center w-full max-w-xs">
            {isScanned ? (
              <div className="bg-[#E8F0FE] rounded-[12px] p-2.5">
                <p className="text-[14px] font-semibold text-[#1F52C9]">
                  {task.locationName} 확인했어요
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[12px] py-2 px-3 border border-[#E8F0FE] flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#6B7690]">
                <ScanLine className="w-4 h-4 text-[#2B6BF3]" />
                <span>아래 버튼을 누르면 바로 찍혀요</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (56px, 14px radius, #2B6BF3) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        {isScanned ? (
          <button
            onClick={onScanComplete}
            className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>시작하기</span>
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={handleSimulateScan}
            className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-5 h-5 stroke-[2.2]" />
            <span>QR 찍기</span>
          </button>
        )}
      </div>
    </div>
  );
};
