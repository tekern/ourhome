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

  const isFormComplete = isRecheckPassed && hasPhoto;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3">
        {/* Anomaly Notification Card (흰색 카드, 모서리 16px, 부적합 색상은 면적 작게) */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE]">
          <div className="flex items-center gap-1.5 text-[#E5484D] text-[13px] font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            <span>이상 조치가 필요해요</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[18px] font-semibold text-[#1B2333]">{task.title}</span>
            <span className="text-[13px] text-[#6B7690]">{task.standardDesc}</span>
          </div>
          <p className="text-[14px] text-[#6B7690] mt-1.5 bg-[#F5F7FB] p-2 rounded-[10px]">
            처음 측정한 값 <span className="font-bold text-[#E5484D]">{failedValue.replace(/^\+/, '')}</span> ({
              initialMethod === 'PHOTO'
                ? '사진으로 기록'
                : initialMethod === 'DIRECT'
                ? '직접 입력'
                : '자동 연결'
            })
          </p>
        </div>

        {/* Step A: 3 Action Selection Buttons */}
        <div>
          <label className="text-[14px] font-semibold text-[#1B2333] block mb-1.5 px-0.5">
            1. 어떻게 조치할지 골라주세요
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
                  className={`py-3 px-1 rounded-[14px] text-[14px] font-medium flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F0FE] text-[#1F52C9] border-[#2B6BF3] font-semibold'
                      : 'bg-white text-[#6B7690] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#2B6BF3]' : 'text-[#6B7690]'}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Photo verification */}
        <div>
          <label className="text-[14px] font-semibold text-[#1B2333] block mb-1.5 px-0.5">
            2. 조치 후 사진을 찍어주세요
          </label>
          <div
            onClick={() => setHasPhoto(true)}
            className={`w-full h-16 rounded-[16px] border border-dashed flex items-center justify-center gap-2 cursor-pointer transition ${
              hasPhoto
                ? 'bg-[#E8F0FE] border-[#2B6BF3] text-[#1F52C9]'
                : 'bg-white border-[#BCD0F7] text-[#6B7690] hover:bg-[#F5F7FB]'
            }`}
          >
            {hasPhoto ? (
              <>
                <div className="w-7 h-7 rounded-full bg-[#2B6BF3] text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[14px] font-semibold">사진이 등록되었어요 (다시 찍기 가능)</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 text-[#2B6BF3]" />
                <span className="text-[14px] font-medium">눌러서 사진 찍기</span>
              </>
            )}
          </div>
        </div>

        {/* Step C: Re-measurement */}
        <div>
          <label className="text-[14px] font-semibold text-[#1B2333] block mb-1.5 px-0.5">
            3. 다시 측정한 결과를 확인해주세요
          </label>
          <div className="bg-white rounded-[16px] p-3.5 border border-[#E8F0FE]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] text-[#6B7690] block">다시 측정한 값</span>
                <span className="text-[28px] font-bold text-[#1B2333] tabular-nums">
                  {recheckValue}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-19.2℃' : '3.6℃');
                  }}
                  className="px-3 py-1.5 bg-[#E8F0FE] hover:bg-[#d8e7fe] text-[#1F52C9] text-[13px] font-semibold rounded-[8px] cursor-pointer"
                >
                  적합으로 다시 측정
                </button>
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-15.5℃' : '7.2℃');
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#E5484D] text-[13px] font-semibold rounded-[8px] cursor-pointer"
                >
                  기준 초과로 다시 측정
                </button>
              </div>
            </div>

            {isRechecked && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                {isRecheckPassed ? (
                  <>
                    <Check className="w-4 h-4 text-[#22A06B] stroke-[2.5]" />
                    <span className="text-[13px] font-semibold text-[#22A06B]">다시 측정한 결과 적합이에요</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#E5484D] stroke-[2.5]" />
                    <span className="text-[13px] font-semibold text-[#E5484D]">다시 측정한 결과도 기준을 넘었어요</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (56px, 14px radius, 비활성은 #E3EAF8 배경에 #9FB0D4 글자) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        {isFormComplete ? (
          <button
            onClick={handleComplete}
            className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>조치 완료할게요</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-14 bg-[#E3EAF8] text-[#9FB0D4] font-medium text-[16px] rounded-[14px] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>사진을 찍고 다시 측정하면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
