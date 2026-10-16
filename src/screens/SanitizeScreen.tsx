import React, { useState, useEffect } from 'react';
import { CcpTask } from '../types';
import { Timer, Camera, Check, Bell, Play } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { PhotoViewModal } from '../components/PhotoViewModal';

interface SanitizeScreenProps {
  task: CcpTask;
  onComplete: (value: string, photoUrl?: string) => void;
}

export const SanitizeScreen: React.FC<SanitizeScreenProps> = ({ task, onComplete }) => {
  const [demoFastMode, setDemoFastMode] = useState(true);
  const totalSeconds = demoFastMode ? 10 : 300;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isRunning && !timerFinished) {
      setSecondsLeft(demoFastMode ? 10 : 300);
    }
  }, [demoFastMode, isRunning, timerFinished]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            setTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  const handleFinish = () => {
    onComplete('소독액에 담그고 헹굼 완료', photoId);
  };

  const isFormComplete = timerFinished && Boolean(photoId);

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3.5">
        {/* Header Standard Info */}
        <div className="bg-white rounded-[18px] p-4.5 border border-[#E8F0FE] flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-[#1B2333] tracking-tight">{task.title}</h2>
          <span className="text-[16px] font-bold text-[#2B6BF3] bg-[#E8F0FE] px-3.5 py-1.5 rounded-[10px]">
            소독액 100ppm
          </span>
        </div>

        {/* 1. Timer Card */}
        <div className="bg-white rounded-[18px] p-5 border border-[#E8F0FE] flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="font-bold text-[#1B2333] text-[18px] flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#2B6BF3]" />
              1. 5분 담그기
            </span>

            {/* Fast Demo Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#F5F7FB] px-3 py-1.5 rounded-full border border-slate-200">
              <input
                type="checkbox"
                checked={demoFastMode}
                disabled={isRunning}
                onChange={(e) => setDemoFastMode(e.target.checked)}
                className="w-4 h-4 accent-[#2B6BF3] rounded cursor-pointer"
              />
              <span className="text-[14px] font-semibold text-[#64748B]">데모 10초</span>
            </label>
          </div>

          {/* 64px Timer Digits */}
          <div className="my-3 text-center">
            <div
              className={`text-[64px] font-black font-mono tabular-nums tracking-tight leading-none ${
                timerFinished
                  ? 'text-[#16A34A]'
                  : isRunning
                  ? 'text-[#2B6BF3]'
                  : 'text-[#64748B]'
              }`}
            >
              {formatTimer(secondsLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E8F0FE] h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                timerFinished ? 'bg-[#16A34A]' : 'bg-[#2B6BF3]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Start / Stop */}
          {!timerFinished ? (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-4 rounded-[14px] font-extrabold text-[18px] flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                isRunning
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#2B6BF3] hover:bg-[#1F52C9] text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Bell className="w-5 h-5 animate-spin" />
                  <span>타이머 정지</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>타이머 시작 ({demoFastMode ? '10초' : '5분'})</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3.5 bg-[#E8F0FE] rounded-[14px] flex items-center justify-center gap-2 text-[#1F52C9] text-[16px] font-bold">
              <Check className="w-5 h-5 text-[#2B6BF3] stroke-[3]" />
              <span>담그기 완료</span>
            </div>
          )}
        </div>

        {/* 2. Rinse Photo Card */}
        <div className="bg-white rounded-[18px] p-4.5 border border-[#E8F0FE]">
          <span className="font-bold text-[18px] text-[#1B2333] block mb-2.5">
            2. 헹구고 사진 찍기
          </span>

          <CameraCapture
            photoId={photoId}
            disabled={!timerFinished}
            label={
              timerFinished
                ? '헹굼 사진 찍기'
                : '1단계가 끝나면 사진을 찍을 수 있어요'
            }
            onPhotoCaptured={(id) => setPhotoId(id)}
            onViewPhoto={(url) => setModalPhotoUrl(url)}
          />
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoViewModal
        isOpen={Boolean(modalPhotoUrl)}
        photoUrl={modalPhotoUrl}
        title="소독 헹굼 사진"
        onClose={() => setModalPhotoUrl(null)}
      />

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        {isFormComplete ? (
          <button
            onClick={handleFinish}
            className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>완료할게요</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-15 bg-[#E3EAF8] text-[#9FB0D4] font-bold text-[18px] rounded-[16px] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>1·2단계를 마치면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
