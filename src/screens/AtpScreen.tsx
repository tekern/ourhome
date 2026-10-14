import React, { useState } from 'react';
import { AtpSpot } from '../types';
import { Sparkles, QrCode, Check, ChevronRight } from 'lucide-react';

interface AtpScreenProps {
  spots: AtpSpot[];
  onCompleteAtp: (updatedSpots: AtpSpot[]) => void;
}

export const AtpScreen: React.FC<AtpScreenProps> = ({ spots: initialSpots, onCompleteAtp }) => {
  const [spots, setSpots] = useState<AtpSpot[]>(initialSpots);
  const [activeSpotIndex, setActiveSpotIndex] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);

  const mockRluValues = [42, 68, 125, 38];

  const currentSpot = spots[activeSpotIndex];
  const completedSpotsCount = spots.filter((s) => s.rluValue !== undefined).length;
  const allSpotsDone = completedSpotsCount === 4;

  const handleMeasureCurrentSpot = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      const val = mockRluValues[activeSpotIndex];
      const updated = spots.map((s, idx) => {
        if (idx === activeSpotIndex) {
          return {
            ...s,
            rluValue: val,
            passed: val <= 200,
          };
        }
        return s;
      });
      setSpots(updated);
      setIsMeasuring(false);

      if (activeSpotIndex < 3) {
        setActiveSpotIndex(activeSpotIndex + 1);
      }
    }, 400);
  };

  const handleFinishAll = () => {
    onCompleteAtp(spots);
  };

  return (
    <div className="flex-1 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] pt-4.5 px-4.5 pb-4 select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 1. Header Standard Info */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[13px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            주 1회 정기 검증
          </span>
          <h2 className="text-[22px] font-black text-[#111827] mt-1">ATP 청결도 점검</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">적합 기준치</span>
          <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            200 RLU 이하
          </span>
        </div>
      </div>

      {/* 2. Four Fixed Spots List (Pillyze Style) */}
      <div className="my-auto flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 text-sm font-bold text-slate-600">
          <span>사전 지정 고정 4개 지점</span>
          <span className="text-indigo-700 font-black">{completedSpotsCount} / 4 완료</span>
        </div>

        {spots.map((spot, idx) => {
          const isDone = spot.rluValue !== undefined;
          const isCurrent = idx === activeSpotIndex && !allSpotsDone;

          return (
            <div
              key={spot.id}
              onClick={() => setActiveSpotIndex(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isDone
                  ? 'bg-[#F0FDF4] border-emerald-300'
                  : isCurrent
                  ? 'bg-[#F1F3FB] border-[#1C2B4A] ring-2 ring-indigo-200 shadow-sm'
                  : 'bg-[#F8FAFC] border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#1C2B4A] text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {spot.id}
                </div>

                <div className="min-w-0">
                  <h3 className="text-[17px] font-black text-[#111827] truncate leading-tight">
                    {spot.name}
                  </h3>
                  <p className="text-[13px] font-bold text-slate-500 truncate leading-none mt-1">
                    {spot.zone} · {spot.qrCode}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {isDone ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-sm">
                    <span className="tabular-nums">{spot.rluValue} RLU</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                ) : isCurrent ? (
                  <span className="text-[12px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                    측정 대상
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <Check className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Current Active Spot Highlight Card */}
        {!allSpotsDone && currentSpot && (
          <div className="mt-1 bg-white p-3.5 rounded-2xl border-2 border-indigo-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-[#111827]">
                지점 #{currentSpot.id} {currentSpot.name}
              </span>
              <span className="text-xs font-bold text-indigo-700">QR 연동 준비됨</span>
            </div>

            <button
              onClick={handleMeasureCurrentSpot}
              disabled={isMeasuring}
              className="w-full py-3 bg-[#1C2B4A] hover:bg-[#142038] active:scale-[0.98] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <QrCode className="w-5 h-5 text-amber-300" />
              <span>
                {isMeasuring
                  ? 'RLU 수치 자동 수신 중...'
                  : `QR 인식 및 RLU 자동 입력 (지점 ${activeSpotIndex + 1})`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Action Button */}
      <div className="pt-2">
        {allSpotsDone ? (
          <button
            onClick={handleFinishAll}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[20px] rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>4개 지점 전원 적합 · 검증 완료</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full h-16 bg-slate-200 text-slate-400 font-bold text-base rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>4개 고정 지점 측정을 모두 완료해주세요</span>
          </button>
        )}
      </div>
    </div>
  );
};
