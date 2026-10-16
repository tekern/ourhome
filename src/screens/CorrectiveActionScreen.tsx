import React, { useState } from 'react';
import { CcpTask, InputMethod } from '../types';
import { Flame, Sliders, Trash2, Camera, Check, AlertTriangle } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { PhotoViewModal } from '../components/PhotoViewModal';

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
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
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
      photoId
    );
  };

  const hasPhoto = Boolean(photoId);
  const isFormComplete = isRecheckPassed && hasPhoto;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3.5">
        {/* Anomaly Notification Card */}
        <div className="bg-white rounded-[18px] p-4.5 border border-[#E8F0FE]">
          <div className="flex items-center gap-1.5 text-[#E5484D] text-[16px] font-bold mb-1">
            <AlertTriangle className="w-5 h-5 stroke-[2.4]" />
            <span>기준을 초과했어요</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[20px] font-bold text-[#1B2333]">{task.title}</span>
            <span className="text-[15px] font-bold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-0.5 rounded-[8px]">
              {task.standardDesc}
            </span>
          </div>
          <p className="text-[15px] text-[#64748B] font-semibold mt-2 bg-[#F5F7FB] p-2.5 rounded-[12px]">
            처음 측정한 값: <span className="font-extrabold text-[#E5484D]">{failedValue.replace(/^\+/, '')}</span>
          </p>
        </div>

        {/* Step A: 3 Action Selection Buttons */}
        <div>
          <label className="text-[16px] font-bold text-[#1B2333] block mb-2 px-0.5">
            1. 조치 방법 선택
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
                  className={`py-3.5 px-1 rounded-[16px] text-[15px] font-bold flex flex-col items-center justify-center gap-2 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F0FE] text-[#1F52C9] border-[#2B6BF3] shadow-xs'
                      : 'bg-white text-[#64748B] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#2B6BF3]' : 'text-[#64748B]'}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Photo verification */}
        <div>
          <label className="text-[16px] font-bold text-[#1B2333] block mb-2 px-0.5">
            2. 조치 후 사진 찍기
          </label>
          <CameraCapture
            photoId={photoId}
            label="조치 사진 찍기"
            onPhotoCaptured={(id) => setPhotoId(id)}
            onViewPhoto={(url) => setModalPhotoUrl(url)}
          />
        </div>

        {/* Photo View Modal */}
        <PhotoViewModal
          isOpen={Boolean(modalPhotoUrl)}
          photoUrl={modalPhotoUrl}
          title="조치 사진 확인"
          onClose={() => setModalPhotoUrl(null)}
        />

        {/* Step C: Re-measurement */}
        <div>
          <label className="text-[16px] font-bold text-[#1B2333] block mb-2 px-0.5">
            3. 다시 측정
          </label>
          <div className="bg-white rounded-[18px] p-4 border border-[#E8F0FE]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] text-[#64748B] font-semibold block">다시 측정한 값</span>
                <span className="text-[32px] font-black text-[#1B2333] tabular-nums">
                  {recheckValue}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-19.2℃' : '3.6℃');
                  }}
                  className="px-3.5 py-2 bg-[#E8F0FE] hover:bg-[#d8e7fe] text-[#1F52C9] text-[14px] font-bold rounded-[10px] cursor-pointer shadow-xs"
                >
                  적합으로 측정
                </button>
                <button
                  onClick={() => {
                    setIsRechecked(true);
                    setRecheckValue(task.id === 'freezer' ? '-15.5℃' : '7.2℃');
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#E5484D] text-[14px] font-bold rounded-[10px] cursor-pointer"
                >
                  초과로 측정
                </button>
              </div>
            </div>

            {isRechecked && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                {isRecheckPassed ? (
                  <>
                    <Check className="w-5 h-5 text-[#16A34A] stroke-[2.8]" />
                    <span className="text-[15px] font-bold text-[#16A34A]">적합이에요</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#E5484D] stroke-[2.8]" />
                    <span className="text-[15px] font-bold text-[#E5484D]">기준 초과예요</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        {isFormComplete ? (
          <button
            onClick={handleComplete}
            className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>조치 완료할게요</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-15 bg-[#E3EAF8] text-[#9FB0D4] font-bold text-[18px] rounded-[16px] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>사진과 측정을 마치면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
