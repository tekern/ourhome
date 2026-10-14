import React, { useState, useEffect } from 'react';
import { CcpTask } from '../types';
import { Timer, Camera, Check, Bell, Play } from 'lucide-react';

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
  const [rinsePhotoTaken, setRinsePhotoTaken] = useState(false);

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
    onComplete('소독액에 담그고 헹굼 완료', rinsePhotoTaken ? 'rinse_photo.jpg' : undefined);
  };

  const isFormComplete = timerFinished && rinsePhotoTaken;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3">
        {/* Header Standard Info */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE] flex items-center justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#6B7690]">소독</span>
            <h2 className="text-[18px] font-semibold text-[#1B2333] mt-0.5">{task.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-[13px] text-[#6B7690] block">기준</span>
            <span className="text-[14px] font-semibold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-1 rounded-[8px]">
              소독액 100ppm
            </span>
          </div>
        </div>

        {/* 1. Timer Card */}
        <div className="bg-white rounded-[16px] p-4.5 border border-[#E8F0FE] flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-[#1B2333] text-[14px] flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#2B6BF3]" />
              1. 소독액에 5분 담그기
            </span>

            {/* Fast Demo Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#F5F7FB] px-2.5 py-1 rounded-full border border-slate-200">
              <input
                type="checkbox"
                checked={demoFastMode}
                disabled={isRunning}
                onChange={(e) => setDemoFastMode(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#2B6BF3] rounded cursor-pointer"
              />
              <span className="text-[12px] font-medium text-[#6B7690]">데모 10초</span>
            </label>
          </div>

          {/* 56px Timer Digits */}
          <div className="my-2 text-center">
            <div
              className={`text-[56px] font-extrabold font-mono tabular-nums tracking-tight leading-none ${
                timerFinished
                  ? 'text-[#22A06B]'
                  : isRunning
                  ? 'text-[#2B6BF3]'
                  : 'text-[#6B7690]'
              }`}
            >
              {formatTimer(secondsLeft)}
            </div>
            <p className="text-[13px] font-medium text-[#6B7690] mt-2">
              {timerFinished
                ? '소독액에 담그기가 끝났어요. 흐르는 물로 헹궈주세요.'
                : isRunning
                ? '소독액에 담그는 중이에요.'
                : '소독액에 기구를 담그고 시작을 눌러주세요.'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E8F0FE] h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                timerFinished ? 'bg-[#22A06B]' : 'bg-[#2B6BF3]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Start / Stop */}
          {!timerFinished ? (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3 rounded-[12px] font-semibold text-[15px] flex items-center justify-center gap-2 transition cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#2B6BF3] hover:bg-[#1F52C9] text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Bell className="w-4 h-4 animate-spin" />
                  <span>타이머가 돌아가고 있어요 (일시정지)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>타이머 시작 ({demoFastMode ? '10초' : '5분'})</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2.5 bg-[#E8F0FE] rounded-[12px] flex items-center justify-center gap-1.5 text-[#1F52C9] text-[14px] font-semibold">
              <Check className="w-4 h-4 text-[#2B6BF3] stroke-[2.5]" />
              <span>소독액에 담그기가 끝났어요</span>
            </div>
          )}
        </div>

        {/* 2. Rinse Photo Card */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE]">
          <span className="font-semibold text-[14px] text-[#1B2333] block mb-2">
            2. 흐르는 물로 헹구고 사진 찍기
          </span>

          <div
            onClick={() => timerFinished && setRinsePhotoTaken(true)}
            className={`w-full h-18 rounded-[14px] border border-dashed flex items-center justify-center transition cursor-pointer ${
              !timerFinished
                ? 'bg-[#F5F7FB] border-slate-200 text-[#6B7690] cursor-not-allowed'
                : rinsePhotoTaken
                ? 'bg-[#E8F0FE] border-[#2B6BF3] text-[#1F52C9]'
                : 'bg-white border-[#BCD0F7] text-[#2B6BF3] hover:bg-[#E8F0FE]/50'
            }`}
          >
            {rinsePhotoTaken ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#2B6BF3] text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[14px] font-semibold">헹굼 사진이 등록되었어요</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#2B6BF3]" />
                <span className="text-[14px] font-medium">
                  {timerFinished
                    ? '눌러서 헹굼 사진 찍기'
                    : '1단계가 끝나면 사진을 찍을 수 있어요'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (56px, 14px radius, #2B6BF3 or #E3EAF8) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        {isFormComplete ? (
          <button
            onClick={handleFinish}
            className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>완료할게요</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-14 bg-[#E3EAF8] text-[#9FB0D4] font-medium text-[16px] rounded-[14px] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>1·2단계를 마치면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
