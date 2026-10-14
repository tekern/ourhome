import React, { useState } from 'react';
import { AtpSpot } from '../types';
import { QrCode, Check, Camera, AlertTriangle, RotateCcw } from 'lucide-react';

interface AtpScreenProps {
  spots: AtpSpot[];
  onCompleteAtp: (updatedSpots: AtpSpot[]) => void;
}

export const AtpScreen: React.FC<AtpScreenProps> = ({ spots: initialSpots, onCompleteAtp }) => {
  const [spots, setSpots] = useState<AtpSpot[]>(initialSpots);
  const [activeSpotIndex, setActiveSpotIndex] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);

  // Spot 2 has an exceeding value (320 RLU > 200 RLU) as requested
  const mockRluValues = [42, 320, 125, 38];

  const currentSpot = spots[activeSpotIndex];
  const completedSpotsCount = spots.filter((s) => s.rluValue !== undefined).length;
  const allSpotsMeasured = completedSpotsCount === 4;

  // Measure active spot
  const handleMeasureCurrentSpot = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      const val = mockRluValues[activeSpotIndex];
      const isPassed = val <= 200;

      const updated = spots.map((s, idx) => {
        if (idx === activeSpotIndex) {
          return {
            ...s,
            rluValue: val,
            initialRluValue: val > 200 ? val : s.initialRluValue,
            passed: isPassed,
          };
        }
        return s;
      });
      setSpots(updated);
      setIsMeasuring(false);

      if (activeSpotIndex < 3) {
        setActiveSpotIndex(activeSpotIndex + 1);
      }
    }, 350);
  };

  // Corrective retest for spot 2
  const handleRetestSpot2 = (spotId: number) => {
    setIsMeasuring(true);
    setTimeout(() => {
      const retestVal = 45;
      const updated = spots.map((s) => {
        if (s.id === spotId) {
          return {
            ...s,
            rluValue: retestVal,
            passed: true,
            hasRetested: true,
          };
        }
        return s;
      });
      setSpots(updated);
      setIsMeasuring(false);
    }, 350);
  };

  // Toggle photo capture for a specific spot
  const handleTakePhotoForSpot = (spotId: number) => {
    setSpots((prev) =>
      prev.map((s) =>
        s.id === spotId
          ? {
              ...s,
              photoUrl: s.photoUrl ? undefined : `atp_spot_${spotId}.jpg`,
            }
          : s
      )
    );
  };

  const handleFinishAll = () => {
    onCompleteAtp(spots);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3">
        {/* Header Info */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE] flex items-center justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#6B7690]">주 1회</span>
            <h2 className="text-[18px] font-semibold text-[#1B2333] mt-0.5">청결도 측정 (ATP)</h2>
          </div>
          <div className="text-right">
            <span className="text-[13px] text-[#6B7690] block">기준</span>
            <span className="text-[14px] font-semibold text-[#22A06B] bg-emerald-50 px-2.5 py-1 rounded-[8px]">
              200 이하면 적합
            </span>
          </div>
        </div>

        {/* 4 Fixed Spots List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 text-[13px] font-medium text-[#6B7690]">
            <span>정해진 4곳</span>
            <span className="text-[#2B6BF3] font-semibold">{completedSpotsCount} / 4 완료</span>
          </div>

          {spots.map((spot, idx) => {
            const isDone = spot.rluValue !== undefined;
            const isCurrent = idx === activeSpotIndex;
            const isExceeded = spot.rluValue !== undefined && !spot.passed;

            return (
              <div
                key={spot.id}
                onClick={() => setActiveSpotIndex(idx)}
                className={`p-3.5 rounded-[16px] border transition cursor-pointer flex flex-col gap-2 ${
                  isExceeded
                    ? 'bg-rose-50/60 border-rose-200'
                    : isDone
                    ? 'bg-white border-[#E8F0FE]'
                    : isCurrent
                    ? 'bg-[#E8F0FE] border-[#BCD0F7]'
                    : 'bg-white border-transparent hover:border-[#E8F0FE]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-[13px] shrink-0 ${
                        isExceeded
                          ? 'bg-[#E5484D] text-white'
                          : isDone
                          ? 'bg-[#E8F0FE] text-[#1F52C9]'
                          : isCurrent
                          ? 'bg-[#2B6BF3] text-white'
                          : 'bg-[#F5F7FB] text-[#6B7690]'
                      }`}
                    >
                      {spot.id}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#1B2333] truncate leading-tight">
                        {spot.name}
                      </h3>
                      {/* 위치 설명에서 코드 삭제하고 구역만 표시 */}
                      <p className="text-[13px] font-medium text-[#6B7690] truncate mt-0.5">
                        {spot.zone}
                      </p>
                    </div>
                  </div>

                  {/* Measurement Status */}
                  <div className="shrink-0 text-right">
                    {isDone ? (
                      <div className="flex items-center gap-1.5 font-semibold text-[14px]">
                        <span
                          className={`tabular-nums ${
                            spot.passed ? 'text-[#22A06B]' : 'text-[#E5484D]'
                          }`}
                        >
                          {spot.rluValue}
                        </span>

                        {spot.passed ? (
                          <div className="w-6 h-6 rounded-full bg-[#2B6BF3] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#E5484D] text-white flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>
                    ) : isCurrent ? (
                      <span className="text-[12px] font-semibold text-[#1F52C9] bg-[#BCD0F7]/40 px-2 py-0.5 rounded-[6px]">
                        지금 측정
                      </span>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#BCD0F7] flex items-center justify-center text-[#BCD0F7]">
                        <Check className="w-3 h-3 stroke-[2]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Photo Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTakePhotoForSpot(spot.id);
                    }}
                    className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-[8px] transition cursor-pointer ${
                      spot.photoUrl
                        ? 'bg-[#E8F0FE] text-[#1F52C9] font-semibold'
                        : 'bg-[#F5F7FB] text-[#6B7690] hover:bg-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{spot.photoUrl ? '사진 등록 완료 (다시 찍기)' : '사진 찍기'}</span>
                  </button>

                  {isExceeded && (
                    <span className="text-[12px] font-semibold text-[#E5484D] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      기준 초과 (200 넘음)
                    </span>
                  )}
                  {spot.hasRetested && (
                    <span className="text-[12px] font-semibold text-[#22A06B]">
                      다시 씻은 후 적합 (45)
                    </span>
                  )}
                </div>

                {/* Spot 2 Retest Action */}
                {isExceeded && isCurrent && (
                  <div className="mt-1 bg-white p-2.5 rounded-[12px] border border-rose-200 flex items-center justify-between">
                    <span className="text-[12px] text-[#6B7690]">
                      처음 측정한 값 {spot.initialRluValue} (기준 초과)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetestSpot2(spot.id);
                      }}
                      className="bg-[#2B6BF3] hover:bg-[#1F52C9] text-white text-[12px] font-semibold px-2.5 py-1 rounded-[8px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>다시 씻고 측정하기 (45)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Spot Action Card */}
          {currentSpot && (
            <div className="mt-1 bg-white p-4 rounded-[16px] border border-[#E8F0FE] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-semibold text-[#1B2333]">
                    {currentSpot.id}번 {currentSpot.name}
                  </span>
                  <p className="text-[12px] text-[#6B7690]">
                    {currentSpot.id === 2
                      ? '두 번째 곳: 측정 시 기준을 넘는 값(320)이 나와요'
                      : '측정기와 연결 중이에요'}
                  </p>
                </div>

                <button
                  onClick={() => handleTakePhotoForSpot(currentSpot.id)}
                  className={`flex items-center gap-1 text-[13px] px-3 py-1.5 rounded-[8px] font-medium transition cursor-pointer ${
                    currentSpot.photoUrl
                      ? 'bg-[#E8F0FE] text-[#1F52C9] font-semibold'
                      : 'bg-[#F5F7FB] text-[#2B6BF3] hover:bg-[#E8F0FE]'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{currentSpot.photoUrl ? '사진 등록 완료' : '사진 찍기'}</span>
                </button>
              </div>

              <button
                onClick={handleMeasureCurrentSpot}
                disabled={isMeasuring}
                className="w-full py-3 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-semibold text-[15px] rounded-[12px] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {isMeasuring
                    ? '측정값을 가져오고 있어요...'
                    : 'QR 찍고 측정하기'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        {allSpotsMeasured ? (
          <button
            onClick={handleFinishAll}
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
            <span>4곳을 모두 측정하면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
