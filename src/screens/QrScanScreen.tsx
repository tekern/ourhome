import React, { useState, useRef } from 'react';
import { CcpTask } from '../types';
import { QrCode, Check } from 'lucide-react';
import { QrCameraScanner, QrCameraScannerRef } from '../components/QrCameraScanner';

interface QrScanScreenProps {
  task: CcpTask;
  onScanComplete: () => void;
}

export const QrScanScreen: React.FC<QrScanScreenProps> = ({ task, onScanComplete }) => {
  const scannerRef = useRef<QrCameraScannerRef | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleScanSuccess = (code: string) => {
    setIsScanned(true);
  };

  const handleSimulateScan = () => {
    setIsScanned(true);
  };

  const handleBottomButtonClick = () => {
    if (isScanned) {
      onScanComplete();
    } else if (!isCameraActive) {
      scannerRef.current?.startCamera();
    } else {
      handleSimulateScan();
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4 px-4.5 pb-2 overscroll-contain bg-[#F5F7FB] flex flex-col">
        {/* Header Information */}
        <div className="shrink-0 bg-white rounded-[18px] p-4 text-center border border-[#E8F0FE]">
          <h2 className="text-[24px] font-extrabold text-[#1B2333] tracking-tight">
            {task.title}
          </h2>
          <p className="text-[16px] font-bold text-[#64748B] mt-0.5">
            {task.locationName}
          </p>
        </div>

        {/* QR Scanner Area (본문 중앙 정렬) */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2">
          {isScanned ? (
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 bg-white rounded-[24px] border-2 border-[#2B6BF3] flex flex-col items-center justify-center p-6 text-center shadow-xs animate-check-pop">
                <div className="w-18 h-18 rounded-full bg-[#E8F0FE] text-[#2B6BF3] flex items-center justify-center mb-3">
                  <Check className="w-11 h-11 stroke-[3]" />
                </div>
                <span className="text-[#2B6BF3] font-black text-[22px]">
                  확인되었어요
                </span>
                <p className="text-[#64748B] text-[16px] mt-1 font-bold">
                  {task.locationName}
                </p>
              </div>

              {/* Status Note (확인 완료 시에만 표시) */}
              <div className="mt-3 text-center w-full max-w-xs">
                <div className="bg-[#E8F0FE] rounded-[14px] p-2.5">
                  <p className="text-[16px] font-bold text-[#1F52C9]">
                    {task.locationName} 확인 완료
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <QrCameraScanner
              ref={scannerRef}
              expectedCode={task.qrCodeId}
              expectedSpotName={task.title}
              onScanSuccess={handleScanSuccess}
              onFallbackDemo={handleSimulateScan}
              onCameraActiveChange={setIsCameraActive}
            />
          )}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        <button
          onClick={handleBottomButtonClick}
          className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isScanned ? (
            <>
              <span>시작하기</span>
              <Check className="w-6 h-6 stroke-[3]" />
            </>
          ) : (
            <>
              <QrCode className="w-6 h-6 stroke-[2.4]" />
              <span>{isCameraActive ? '인식 완료' : 'QR 찍고 시작'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
