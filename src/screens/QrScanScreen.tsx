import React, { useState, useRef } from 'react';
import { CcpTask } from '../types';
import { QrCode, Check, MapPin, ScanLine } from 'lucide-react';
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
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col justify-between">
        {/* Header Information */}
        <div className="bg-white rounded-[16px] p-4 text-center border border-[#E8F0FE] mb-2">
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

        {/* QR Scanner Area */}
        <div className="my-2 flex flex-col items-center justify-center">
          {isScanned ? (
            <div className="w-64 h-64 bg-white rounded-[24px] border-2 border-[#2B6BF3] flex flex-col items-center justify-center p-6 text-center shadow-xs animate-check-pop">
              <div className="w-16 h-16 rounded-full bg-[#E8F0FE] text-[#2B6BF3] flex items-center justify-center mb-3">
                <Check className="w-10 h-10 stroke-[2.5]" />
              </div>
              <span className="text-[#2B6BF3] font-bold text-[18px]">
                확인되었어요
              </span>
              <p className="text-[#6B7690] text-[14px] mt-1 font-medium">
                {task.locationName}
              </p>
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

        {/* Status Note */}
        <div className="mt-2 text-center w-full">
          {isScanned ? (
            <div className="bg-[#E8F0FE] rounded-[12px] p-2.5">
              <p className="text-[14px] font-semibold text-[#1F52C9]">
                {task.locationName} 확인했어요
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[12px] py-2 px-3 border border-[#E8F0FE] flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#6B7690]">
              <ScanLine className="w-4 h-4 text-[#2B6BF3]" />
              <span>{isCameraActive ? '카메라로 QR 코드를 비춰주세요' : '카메라 켜기 또는 버튼을 눌러주세요'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (56px, 14px radius, #2B6BF3) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        <button
          onClick={handleBottomButtonClick}
          className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isScanned ? (
            <>
              <span>시작하기</span>
              <Check className="w-5 h-5 stroke-[2.5]" />
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5 stroke-[2.2]" />
              <span>{isCameraActive ? '데모 인식 완료' : 'QR 찍고 시작'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
