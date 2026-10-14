import React, { useState } from 'react';
import { CcpTask } from '../types';
import { QrCode, Check, ScanLine, MapPin } from 'lucide-react';

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
    }, 350);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 2단: 가운데 내용 영역 (내용이 넘치면 세로 스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain flex flex-col justify-around">
        {/* Header Information */}
        <div className="text-center px-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>점검 위치 QR 확인</span>
          </div>
          <h2 className="text-[23px] font-black text-[#111827] leading-tight">
            {task.title}
          </h2>
          <p className="text-[16px] font-bold text-slate-700 mt-1">
            {task.locationName}
          </p>
        </div>

        {/* QR Viewfinder Area */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-[#0F172A] rounded-3xl border-4 border-slate-700 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            {/* Corner Guides */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />

            {/* Animated Laser Scan Bar */}
            {isScanningAnim && (
              <div className="absolute left-0 right-0 h-1.5 bg-amber-400 shadow-[0_0_20px_#f59e0b] animate-bounce top-1/2 -translate-y-1/2" />
            )}

            {isScanned ? (
              <div className="flex flex-col items-center text-center p-4 z-10 animate-scale-in">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
                </div>
                <span className="text-emerald-400 font-black text-xl">QR 인식 성공</span>
                <span className="text-white font-mono text-sm mt-1 bg-white/10 px-3 py-1 rounded-full">
                  {task.qrCodeId}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4 z-10">
                <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-slate-400 mb-2 stroke-[1.5]" />
                <span className="text-slate-200 font-bold text-base">
                  기기 앞 QR 코드 스캔
                </span>
              </div>
            )}
          </div>

          {/* Scan Status Message */}
          <div className="mt-3 text-center w-full max-w-xs">
            {isScanned ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <p className="text-sm font-bold text-emerald-800">
                  인증된 지점: <span className="font-black text-emerald-900">{task.locationName}</span>
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <ScanLine className="w-4 h-4 text-slate-600" />
                <span>하단 버튼을 누르면 QR이 즉시 인식됩니다</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 영역 */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10"
      >
        {isScanned ? (
          <button
            onClick={onScanComplete}
            className="w-full h-15 sm:h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[19px] sm:text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>점검 시작하기</span>
            <Check className="w-7 h-7 stroke-[3]" />
          </button>
        ) : (
          <button
            onClick={handleSimulateScan}
            className="w-full h-15 sm:h-16 bg-[#1C2B4A] hover:bg-[#142038] active:scale-[0.98] text-white font-black text-[19px] sm:text-[20px] rounded-2xl shadow-xl shadow-[#1C2B4A]/25 transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            <span>QR 인식하기</span>
          </button>
        )}
      </div>
    </div>
  );
};
