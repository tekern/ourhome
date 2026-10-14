import React, { useState } from 'react';
import { CcpTask, InputMethod } from '../types';
import { Bluetooth, Keyboard, Camera, Check, AlertTriangle, Delete } from 'lucide-react';

interface TempMeasureScreenProps {
  task: CcpTask;
  onComplete: (value: string, method: InputMethod, passed: boolean) => void;
  onFail: (measuredValue: string, method: InputMethod) => void;
}

export const TempMeasureScreen: React.FC<TempMeasureScreenProps> = ({
  task,
  onComplete,
  onFail,
}) => {
  const [method, setMethod] = useState<InputMethod>('BLE');

  const isFreezer = task.id === 'freezer';
  const standardLimit = isFreezer ? -18.0 : 5.0;

  // Temperature input states
  const [bleValue, setBleValue] = useState<number>(isFreezer ? -19.5 : 3.4);
  const [directInput, setDirectInput] = useState<string>(isFreezer ? '-19.2' : '3.6');
  const [photoValue, setPhotoValue] = useState<number>(isFreezer ? -19.0 : 3.8);
  const [photoTaken, setPhotoTaken] = useState<boolean>(false);

  let currentNum = 0;
  let formattedDisplay = '';

  if (method === 'BLE') {
    currentNum = bleValue;
    formattedDisplay = `${currentNum > 0 ? '+' : ''}${currentNum.toFixed(1)}`;
  } else if (method === 'DIRECT') {
    const parsed = parseFloat(directInput);
    currentNum = isNaN(parsed) ? 0 : parsed;
    formattedDisplay = directInput || '0.0';
  } else {
    currentNum = photoValue;
    formattedDisplay = `${currentNum > 0 ? '+' : ''}${currentNum.toFixed(1)}`;
  }

  const isPassed = currentNum <= standardLimit;

  // Keypad handlers for direct input
  const handleKeypadPress = (val: string) => {
    if (val === 'BS') {
      setDirectInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '-') {
      setDirectInput((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    } else if (val === '.') {
      if (!directInput.includes('.')) {
        setDirectInput((prev) => prev + '.');
      }
    } else {
      setDirectInput((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleFinish = () => {
    const finalVal = `${formattedDisplay}℃`;
    if (isPassed) {
      onComplete(finalVal, method, true);
    } else {
      onFail(finalVal, method);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 2단: 가운데 내용 영역 (내용이 넘쳐도 부드럽게 스크롤 가능, 키패드 및 측정 수치 완벽 표시) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain">
        {/* Header & Standard Badge */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <span className="text-[13px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              온도 측정 점검
            </span>
            <h2 className="text-[22px] font-black text-[#111827] mt-1">{task.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 block">적합 기준</span>
            <span className="text-base font-black text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
              {task.standardDesc}
            </span>
          </div>
        </div>

        {/* Three Input Method Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#F1F3FB] rounded-2xl my-2.5">
          <button
            onClick={() => setMethod('BLE')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-black transition cursor-pointer ${
              method === 'BLE'
                ? 'bg-[#1C2B4A] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>자동 BLE</span>
          </button>

          <button
            onClick={() => setMethod('DIRECT')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-black transition cursor-pointer ${
              method === 'DIRECT'
                ? 'bg-[#1C2B4A] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>직접 입력</span>
          </button>

          <button
            onClick={() => setMethod('PHOTO')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-black transition cursor-pointer ${
              method === 'PHOTO'
                ? 'bg-[#1C2B4A] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>사진 촬영</span>
          </button>
        </div>

        {/* Measurement Area */}
        <div className="flex flex-col items-center">
          {/* Giant Number Display */}
          <div
            className={`w-full rounded-3xl p-4 border-2 transition-all flex flex-col items-center shadow-sm ${
              isPassed
                ? 'bg-[#F0FDF4] border-emerald-400'
                : 'bg-[#FFF5F5] border-rose-400 animate-pulse'
            }`}
          >
            <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
              현재 측정 온도 ({method === 'BLE' ? '무선 센서' : method === 'DIRECT' ? '직접 입력' : '사진 분석'})
            </span>

            <div className="flex items-baseline gap-1 my-1">
              <span
                className={`text-6xl sm:text-7xl font-black tabular-nums tracking-tight ${
                  isPassed ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formattedDisplay}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-600">℃</span>
            </div>

            {/* Instant Judgment Card */}
            <div
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-black text-[15px] sm:text-[16px] shadow-sm ${
                isPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isPassed ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>적합 (기준 {task.standardDesc} 만족)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 stroke-[3]" />
                  <span>부적합 (기준 {task.standardDesc} 초과!)</span>
                </>
              )}
            </div>
          </div>

          {/* Method-Specific Controls */}
          <div className="w-full mt-3">
            {method === 'BLE' && (
              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                  <span className="flex items-center gap-1 font-bold text-indigo-700">
                    <Bluetooth className="w-4 h-4" />
                    무선 탐침 PROBE-04 연동됨
                  </span>
                  <span className="text-emerald-700 font-extrabold">신호 정상</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBleValue(isFreezer ? -19.4 : 3.4)}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl border transition cursor-pointer ${
                      isPassed
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    적합값 시연 ({isFreezer ? '-19.4℃' : '3.4℃'})
                  </button>
                  <button
                    onClick={() => setBleValue(isFreezer ? -14.2 : 8.2)}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl border transition cursor-pointer ${
                      !isPassed
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    부적합 시연 ({isFreezer ? '-14.2℃' : '8.2℃'})
                  </button>
                </div>
              </div>
            )}

            {method === 'DIRECT' && (
              <div className="grid grid-cols-4 gap-1.5 w-full bg-[#F1F3FB] p-2 rounded-2xl border border-slate-200">
                {['1', '2', '3', '-'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeypadPress(k)}
                    className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl font-black text-xl text-slate-900 shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                {['4', '5', '6', '.'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeypadPress(k)}
                    className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl font-black text-xl text-slate-900 shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                {['7', '8', '9', '0'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeypadPress(k)}
                    className="h-11 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl font-black text-xl text-slate-900 shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                <div className="col-span-4 flex gap-1.5 mt-0.5">
                  <button
                    onClick={() => setDirectInput(isFreezer ? '-19.2' : '3.6')}
                    className="flex-1 h-9 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-xs font-black text-emerald-800 cursor-pointer"
                  >
                    기준 적합값
                  </button>
                  <button
                    onClick={() => setDirectInput(isFreezer ? '-13.5' : '7.8')}
                    className="flex-1 h-9 bg-rose-100 hover:bg-rose-200 rounded-xl text-xs font-black text-rose-800 cursor-pointer"
                  >
                    부적합 테스트
                  </button>
                  <button
                    onClick={() => handleKeypadPress('BS')}
                    className="w-16 h-9 bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded-xl flex items-center justify-center text-slate-900 font-black cursor-pointer"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {method === 'PHOTO' && (
              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-200 text-center">
                <div className="w-full h-20 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden mb-2 text-white">
                  <div className="text-center">
                    <span className="text-[12px] text-amber-300 block font-bold">
                      탐침 눈금 자동 인식
                    </span>
                    <span className="text-xl font-black font-mono">
                      {photoTaken ? `${photoValue}℃ 촬영 완료` : '촬영 대기'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPhotoTaken(true);
                      setPhotoValue(isFreezer ? -19.0 : 3.8);
                    }}
                    className="flex-1 py-2.5 bg-[#1C2B4A] hover:bg-[#142038] active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>적합 촬영 (3.8℃)</span>
                  </button>
                  <button
                    onClick={() => {
                      setPhotoTaken(true);
                      setPhotoValue(isFreezer ? -13.0 : 8.5);
                    }}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>부적합 촬영 (8.5℃)</span>
                  </button>
                </div>
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
        {isPassed ? (
          <button
            onClick={handleFinish}
            className="w-full h-15 sm:h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[19px] sm:text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>적합 판정 완료</span>
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full h-15 sm:h-16 bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] text-white font-black text-[19px] sm:text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
          >
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            <span>부적합 조치 진행하기</span>
          </button>
        )}
      </div>
    </div>
  );
};
