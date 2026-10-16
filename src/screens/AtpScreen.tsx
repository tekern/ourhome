import React, { useState, useRef } from 'react';
import { AtpSpot } from '../types';
import { QrCode, Check, Camera, AlertTriangle, RotateCcw, X, Eye } from 'lucide-react';
import { QrCameraScanner } from '../components/QrCameraScanner';
import { PhotoViewModal } from '../components/PhotoViewModal';
import { resizeAndCompressImage, savePhotoToIdb, getPhotoFromIdb } from '../utils/photoStorage';

interface AtpScreenProps {
  spots: AtpSpot[];
  onCompleteAtp: (updatedSpots: AtpSpot[]) => void;
}

export const AtpScreen: React.FC<AtpScreenProps> = ({ spots: initialSpots, onCompleteAtp }) => {
  const [spots, setSpots] = useState<AtpSpot[]>(initialSpots);
  const [activeSpotIndex, setActiveSpotIndex] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [activeSpotForPhoto, setActiveSpotForPhoto] = useState<number | null>(null);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Spot 2 has an exceeding value (320 RLU > 200 RLU) as requested
  const mockRluValues = [42, 320, 125, 38];

  const currentSpot = spots[activeSpotIndex];
  const completedSpotsCount = spots.filter((s) => s.rluValue !== undefined).length;
  const allSpotsMeasured = completedSpotsCount === 4;

  // Measure active spot (initial measurement or corrective retest)
  const handleMeasureCurrentSpot = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      const spot = spots[activeSpotIndex];
      const isRetest = spot.rluValue !== undefined && !spot.passed;
      const val = isRetest ? 45 : mockRluValues[activeSpotIndex];
      const isPassed = val <= 200;

      const updated = spots.map((s, idx) => {
        if (idx === activeSpotIndex) {
          return {
            ...s,
            rluValue: val,
            initialRluValue: val > 200 ? val : s.initialRluValue,
            passed: isPassed,
            hasRetested: isRetest ? true : s.hasRetested,
          };
        }
        return s;
      });
      setSpots(updated);
      setIsMeasuring(false);

      if (activeSpotIndex < 3 && !isRetest) {
        setActiveSpotIndex(activeSpotIndex + 1);
      }
    }, 350);
  };

  // Open real camera file input for a spot
  const handleTriggerPhotoForSpot = (spotId: number) => {
    setActiveSpotForPhoto(spotId);
    setPhotoError(null);
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSpotForPhoto === null) return;

    try {
      const compressedUrl = await resizeAndCompressImage(file, 800, 0.7);
      const photoId = `atp_spot_${activeSpotForPhoto}_${Date.now()}`;
      await savePhotoToIdb(photoId, compressedUrl);

      setSpots((prev) =>
        prev.map((s) =>
          s.id === activeSpotForPhoto
            ? {
                ...s,
                photoUrl: photoId,
              }
            : s
        )
      );
    } catch (err) {
      console.error('ATP photo error', err);
      setPhotoError('사진을 저장하지 못했어요. 다시 찍어주세요');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setActiveSpotForPhoto(null);
    }
  };

  const handleOpenPhotoModal = async (photoIdOrUrl: string) => {
    const fromDb = await getPhotoFromIdb(photoIdOrUrl);
    setModalPhotoUrl(fromDb || photoIdOrUrl);
  };

  const handleFinishAll = () => {
    onCompleteAtp(spots);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden relative">
      {/* Hidden real camera capture input for ATP spot photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* 2단: 가운데 내용 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB] flex flex-col gap-3.5">
        {/* Header Info */}
        <div className="bg-white rounded-[18px] p-4.5 border border-[#E8F0FE] flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-[#1B2333] tracking-tight">청결도 측정</h2>
          <span className="text-[16px] font-bold text-[#16A34A] bg-emerald-50 px-3.5 py-1.5 rounded-[10px]">
            200 이하 적합
          </span>
        </div>

        {/* 4 Fixed Spots List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-[16px] font-bold text-[#1B2333]">
            <span>정해진 4곳</span>
            <span className="text-[#2B6BF3]">{completedSpotsCount} / 4 완료</span>
          </div>

          {photoError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[14px] text-[#E5484D] text-[14px] font-bold">
              {photoError}
            </div>
          )}

          {spots.map((spot, idx) => {
            const isDone = spot.rluValue !== undefined;
            const isCurrent = idx === activeSpotIndex;
            const isExceeded = spot.rluValue !== undefined && !spot.passed;

            return (
              <div
                key={spot.id}
                onClick={() => {
                  setActiveSpotIndex(idx);
                  setIsScanningQr(true);
                }}
                className={`p-4.5 rounded-[18px] border transition cursor-pointer flex flex-col gap-3 ${
                  isExceeded
                    ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                    : isDone
                    ? 'bg-white border-[#E8F0FE]'
                    : isCurrent
                    ? 'bg-[#E8F0FE] border-[#BCD0F7] shadow-xs'
                    : 'bg-white border-transparent hover:border-[#E8F0FE]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-[12px] flex items-center justify-center font-black text-[18px] shrink-0 shadow-xs ${
                        isExceeded
                          ? 'bg-[#E5484D] text-white'
                          : isDone
                          ? 'bg-[#E8F0FE] text-[#1F52C9]'
                          : 'bg-[#2B6BF3] text-white'
                      }`}
                    >
                      {spot.id}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[19px] font-extrabold text-[#1B2333] truncate leading-tight">
                        {spot.name}
                      </h3>
                      <p className="text-[14px] font-semibold text-[#64748B] truncate mt-0.5">
                        {spot.zone}
                      </p>
                    </div>
                  </div>

                  {/* Measurement Status & Direct QR Action */}
                  <div className="shrink-0">
                    {isDone ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`tabular-nums text-[18px] font-black ${
                            spot.passed ? 'text-[#16A34A]' : 'text-[#E5484D]'
                          }`}
                        >
                          {spot.rluValue}
                        </span>

                        {spot.passed ? (
                          <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-5 h-5 stroke-[2.8]" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSpotIndex(idx);
                              setIsScanningQr(true);
                            }}
                            className="bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-95 text-white text-[13px] font-bold px-3 py-1.5 rounded-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>재측정</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSpotIndex(idx);
                          setIsScanningQr(true);
                        }}
                        className="bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-95 text-white font-extrabold text-[15px] px-3.5 py-2 rounded-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <QrCode className="w-4.5 h-4.5 stroke-[2.4]" />
                        <span>QR 측정</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Strip: Photo & Alerts */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/90">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerPhotoForSpot(spot.id);
                      }}
                      className={`flex items-center gap-1.5 text-[14px] font-semibold px-3 py-1.5 rounded-[10px] transition cursor-pointer ${
                        spot.photoUrl
                          ? 'bg-[#E8F0FE] text-[#1F52C9] font-bold'
                          : 'bg-[#F5F7FB] text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>{spot.photoUrl ? '사진 다시 찍기' : '사진 찍기'}</span>
                    </button>

                    {spot.photoUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (spot.photoUrl) handleOpenPhotoModal(spot.photoUrl);
                        }}
                        className="text-[14px] text-[#2B6BF3] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>사진 보기</span>
                      </button>
                    )}
                  </div>

                  {isExceeded && (
                    <span className="text-[14px] font-bold text-[#E5484D] flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      기준 초과 (다시 씻고 측정)
                    </span>
                  )}
                  {spot.hasRetested && (
                    <span className="text-[14px] font-bold text-[#16A34A]">
                      다시 씻은 후 적합
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Camera Scanner Modal for ATP Spot */}
      {isScanningQr && currentSpot && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-xs select-none animate-fadeIn">
          <div className="w-full max-w-[340px] bg-white rounded-[24px] p-5 shadow-2xl flex flex-col items-center border border-slate-100">
            <div className="flex items-center justify-between w-full mb-3">
              <div>
                <span className="text-[13px] font-bold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
                  ATP {currentSpot.id}번
                </span>
                <h3 className="text-[19px] font-bold text-[#1B2333] mt-1">
                  {currentSpot.name}
                </h3>
              </div>
              <button
                onClick={() => setIsScanningQr(false)}
                className="p-1.5 text-[#6B7690] hover:text-[#1B2333] active:scale-95 transition rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <QrCameraScanner
              expectedCode={currentSpot.qrCode}
              expectedSpotName={currentSpot.name}
              onScanSuccess={() => {
                setIsScanningQr(false);
                handleMeasureCurrentSpot();
              }}
              onFallbackDemo={() => {
                setIsScanningQr(false);
                handleMeasureCurrentSpot();
              }}
            />
          </div>
        </div>
      )}

      {/* Photo Modal */}
      <PhotoViewModal
        isOpen={Boolean(modalPhotoUrl)}
        photoUrl={modalPhotoUrl}
        title="청결도 점검 사진"
        onClose={() => setModalPhotoUrl(null)}
      />

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        {allSpotsMeasured ? (
          <button
            onClick={handleFinishAll}
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
            <span>4곳을 모두 측정하면 끝나요</span>
          </button>
        )}
      </div>
    </div>
  );
};
