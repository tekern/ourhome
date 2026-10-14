import React, { useState, useEffect } from 'react';
import { CcpTask } from '../types';
import { Timer, Camera, Check, BellRing, Play } from 'lucide-react';

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
    onComplete('소독 침지 및 헹굼 완료', rinsePhotoTaken ? 'rinse_photo.jpg' : undefined);
  };

  return (
    <div className="flex-1 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] pt-4.5 px-4.5 pb-4 select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 1. Header Standard Info */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[13px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            세척·소독 필수
          </span>
          <h2 className="text-[22px] font-black text-[#111827] mt-1">{task.title}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">약품 유효 농도</span>
          <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
            100ppm 침지
          </span>
        </div>
      </div>

      {/* 2. Immersion Timer & Rinse Photo Flow */}
      <div className="my-auto flex flex-col gap-3.5">
        {/* Timer Card */}
        <div className="bg-[#F8FAFC] rounded-3xl p-4.5 border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs mb-1">
            <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Timer className="w-5 h-5 text-indigo-600" />
              1단계: 소독액 5분 침지 타이머
            </span>

            {/* Fast Demo Switch */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-slate-300 px-2.5 py-1 rounded-full shadow-sm transition">
              <input
                type="checkbox"
                checked={demoFastMode}
                disabled={isRunning}
                onChange={(e) => setDemoFastMode(e.target.checked)}
                className="w-4 h-4 accent-[#1C2B4A] rounded cursor-pointer"
              />
              <span className="text-[12px] font-black text-slate-700">시연 10초</span>
            </label>
          </div>

          {/* Large Countdown Display */}
          <div className="my-2 text-center">
            <div
              className={`text-6xl font-black font-mono tabular-nums tracking-tight ${
                timerFinished
                  ? 'text-emerald-700'
                  : isRunning
                  ? 'text-[#1C2B4A]'
                  : 'text-slate-400'
              }`}
            >
              {formatTimer(secondsLeft)}
            </div>
            <p className="text-sm font-bold text-slate-600 mt-1">
              {timerFinished
                ? '✓ 침지 완료! 기구를 깨끗한 물로 헹구세요.'
                : isRunning
                ? '약품 침지 소독 진행 중... 잠시 대기하세요.'
                : '소독액에 기구를 담그고 시작을 누르세요.'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                timerFinished ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Start / Finished Button */}
          {!timerFinished ? (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#1C2B4A] hover:bg-[#142038] text-white shadow-md'
              }`}
            >
              {isRunning ? (
                <>
                  <BellRing className="w-5 h-5 animate-spin" />
                  <span>침지 진행 중 (일시정지)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>침지 시작 ({demoFastMode ? '10초' : '5분'})</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-900 text-sm font-black">
              <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
              <span>소독액 침지 소독 완료됨</span>
            </div>
          )}
        </div>

        {/* Step 2: Rinse Photo Card */}
        <div className="bg-[#F8FAFC] rounded-3xl p-4 border border-slate-200 shadow-sm">
          <span className="font-black text-sm text-slate-800 block mb-1.5">
            2단계: 깨끗한 음용수 헹굼 확인 (사진 1장)
          </span>

          <div
            onClick={() => timerFinished && setRinsePhotoTaken(true)}
            className={`w-full h-22 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer ${
              !timerFinished
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : rinsePhotoTaken
                ? 'bg-[#F0FDF4] border-emerald-400 text-emerald-800'
                : 'bg-indigo-50/70 border-indigo-300 text-indigo-700 hover:bg-indigo-100/50'
            }`}
          >
            {rinsePhotoTaken ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <span className="text-sm font-black">헹굼 사진 등록 완료 (탭하여 재촬영)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-indigo-700" />
                <span className="text-sm font-black">
                  {timerFinished
                    ? '탭하여 헹굼 완료 사진 촬영'
                    : '1단계 침지가 끝난 후 촬영 가능합니다'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Button */}
      <div className="pt-2">
        {timerFinished && rinsePhotoTaken ? (
          <button
            onClick={handleFinish}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>세척·소독 점검 완료</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-16 bg-slate-200 text-slate-400 font-bold text-base rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>침지 완료 및 사진 촬영 후 완료 가능</span>
          </button>
        )}
      </div>
    </div>
  );
};
