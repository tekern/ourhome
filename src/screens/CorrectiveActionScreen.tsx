import React, { useState } from 'react';
import { CcpTask, InputMethod } from '../types';
import { Flame, Sliders, Trash2, Camera, Check, AlertTriangle } from 'lucide-react';

interface CorrectiveActionScreenProps {
  task: CcpTask;
  failedValue: string;
  initialMethod: InputMethod;
  onResolveAnomaly: (
    action: '재가열' | '온도 재조정' | '폐기',
    recheckValue: string,
    photoUrl?: string
  ) => void;
}

export const CorrectiveActionScreen: React.FC<CorrectiveActionScreenProps> = ({
  task,
  failedValue,
  initialMethod,
  onResolveAnomaly,
}) => {
  const [selectedAction, setSelectedAction] = useState<'재가열' | '온도 재조정' | '폐기'>('온도 재조정');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [recheckValue, setRecheckValue] = useState<string>(
    task.id === 'freezer' ? '-19.2℃' : '3.6℃'
  );
  const [isRechecked, setIsRechecked] = useState(false);

  const num = parseFloat(recheckValue.replace('℃', ''));
  const limit = task.id === 'freezer' ? -18.0 : 5.0;
  const isRecheckPassed = num <= limit;

  const handleComplete = () => {
    onResolveAnomaly(
      selectedAction,
      recheckValue,
      hasPhoto ? 'captured_photo_action.jpg' : undefined
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] pt-4.5 px-4.5 pb-4 select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 1. Anomaly Notification Card */}
      <div className="bg-[#FFF5F5] border-2 border-rose-400 rounded-3xl p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>기준 초과 발생 (즉시 조치 필요)</span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-[20px] font-black text-[#111827]">{task.title}</span>
          <span className="text-xs text-rose-800 font-extrabold">기준: {task.standardDesc}</span>
        </div>
        <p className="text-sm font-bold text-rose-900 mt-1 bg-white/80 px-2.5 py-1 rounded-xl">
          1차 측정치: <span className="font-black text-rose-700 text-base">{failedValue}</span> (
          {initialMethod} 입력)
        </p>
      </div>

      {/* 2. Middle Steps: Action choice -> Photo -> Recheck */}
      <div className="my-auto flex flex-col gap-3">
        {/* Step A: 3 Action Selection Buttons */}
        <div>
          <label className="text-sm font-black text-slate-800 block mb-1.5">
            1단계: 즉시 조치 방법 선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '온도 재조정', icon: Sliders, label: '온도 재조정' },
              { id: '재가열', icon: Flame, label: '재가열' },
              { id: '폐기', icon: Trash2, label: '폐기' },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = selectedAction === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setSelectedAction(btn.id as any)}
                  className={`py-3 px-1 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C2B4A] text-white border-[#1C2B4A] shadow-md ring-2 ring-indigo-200'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Photo verification */}
        <div>
          <label className="text-sm font-black text-slate-800 block mb-1.5">
            2단계: 조치 사진 증빙 (1장 필수)
          </label>
          <div
            onClick={() => setHasPhoto(true)}
            className={`w-full h-18 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2.5 cursor-pointer transition ${
              hasPhoto
                ? 'bg-[#F0FDF4] border-emerald-400 text-emerald-800'
                : 'bg-[#F1F3FB] border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {hasPhoto ? (
              <>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <span className="text-sm font-black">조치 사진 등록 완료 (탭하여 재촬영)</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6 text-indigo-700" />
                <span className="text-sm font-black">탭하여 조치 확인 사진 촬영</span>
              </>
            )}
          </div>
        </div>

        {/* Step C: Re-measurement */}
        <div>
          <label className="text-sm font-black text-slate-800 block mb-1.5">
            3단계: 조치 후 재측정 (적합 판정 필수)
          </label>
          <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">재측정 값</span>
                <span className="text-3xl font-black text-emerald-700 tabular-nums">
                  {recheckValue}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-19.2℃' : '3.6℃');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow cursor-pointer"
                >
                  적합 재측정
                </button>
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-15.5℃' : '7.2℃');
                  }}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow cursor-pointer"
                >
                  부적합 재측정
                </button>
              </div>
            </div>

            {isRechecked && (
              <div
                className={`mt-2 py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                  isRecheckPassed
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {isRecheckPassed ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                    <span>재측정 결과 정상 적합 (완료 가능)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-700 stroke-[3]" />
                    <span>재측정 여전히 부적합 (추가 조치 필요)</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Button */}
      <div className="pt-2">
        {isRecheckPassed && hasPhoto ? (
          <button
            onClick={handleComplete}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>조치 완료 (이상 기록 보관)</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-16 bg-slate-200 text-slate-400 font-bold text-base rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>사진 촬영 및 재측정 적합 시 완료 가능</span>
          </button>
        )}
      </div>
    </div>
  );
};
