import React, { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, AlertTriangle, Eye, Check } from 'lucide-react';
import { resizeAndCompressImage, savePhotoToIdb, getPhotoFromIdb } from '../utils/photoStorage';

interface CameraCaptureProps {
  photoId?: string; // Existing photo ID in IndexedDB
  onPhotoCaptured: (photoId: string, dataUrl: string) => void;
  onViewPhoto?: (dataUrl: string) => void;
  label?: string; // Optional label e.g. "사진 찍기"
  compact?: boolean; // For compact list rows
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  photoId,
  onPhotoCaptured,
  onViewPhoto,
  label = '사진 찍기',
  compact = false,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If photoId changes or is provided, load preview from IndexedDB
  useEffect(() => {
    let isMounted = true;
    if (photoId) {
      getPhotoFromIdb(photoId).then((url) => {
        if (isMounted && url) {
          setPreviewUrl(url);
        }
      });
    } else {
      setPreviewUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [photoId]);

  const handleTriggerCapture = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isLoading) return;
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Resize long edge to 800px and compress JPEG 0.7
      const compressedDataUrl = await resizeAndCompressImage(file, 800, 0.7);

      // 2. Save into IndexedDB with unique ID
      const newPhotoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await savePhotoToIdb(newPhotoId, compressedDataUrl);

      setPreviewUrl(compressedDataUrl);
      onPhotoCaptured(newPhotoId, compressedDataUrl);
    } catch (err: any) {
      console.error('Photo capture/save error', err);
      setErrorMessage('사진을 저장하지 못했어요. 다시 찍어주세요');
    } finally {
      setIsLoading(false);
      // Reset input value so the same file can be captured again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && onViewPhoto) {
      onViewPhoto(previewUrl);
    }
  };

  return (
    <div className="w-full select-none">
      {/* Hidden real camera capture input with environment facing mode */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        // Preview + [다시 찍기] button state
        <div
          className={`flex items-center justify-between rounded-[14px] bg-[#E8F0FE] border border-[#2B6BF3] transition ${
            compact ? 'p-2' : 'p-3'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail */}
            <div
              onClick={handlePreviewClick}
              title="크게 보기"
              className="relative w-12 h-12 rounded-[10px] overflow-hidden bg-slate-200 border border-white shrink-0 cursor-pointer shadow-xs active:scale-95 transition"
            >
              <img
                src={previewUrl}
                alt="촬영 미리보기"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <Eye className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1F52C9]">
                <Check className="w-4 h-4 text-[#2B6BF3] stroke-[2.5]" />
                <span>사진 등록 완료</span>
              </div>
              <p className="text-[12px] text-[#6B7690] truncate">
                {compact ? '사진이 등록되었어요' : '터치하면 크게 볼 수 있어요'}
              </p>
            </div>
          </div>

          {/* 다시 찍기 버튼 */}
          <button
            type="button"
            onClick={handleTriggerCapture}
            disabled={disabled || isLoading}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#2B6BF3] bg-white hover:bg-slate-50 active:scale-95 px-3 py-1.5 rounded-[10px] border border-[#BCD0F7] shadow-xs transition cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다시 찍기</span>
          </button>
        </div>
      ) : (
        // Initial empty state: [사진 찍기]
        <div>
          <button
            type="button"
            onClick={handleTriggerCapture}
            disabled={disabled || isLoading}
            className={`w-full flex items-center justify-center gap-2 rounded-[14px] border border-dashed transition cursor-pointer font-medium ${
              disabled
                ? 'bg-[#F5F7FB] border-slate-200 text-[#6B7690] cursor-not-allowed py-3'
                : 'bg-white border-[#BCD0F7] text-[#2B6BF3] hover:bg-[#E8F0FE]/50 active:scale-[0.99] py-3.5 shadow-xs'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-[14px] text-[#2B6BF3] font-semibold">
                <div className="w-4 h-4 border-2 border-[#2B6BF3] border-t-transparent rounded-full animate-spin" />
                <span>사진을 저장하는 중...</span>
              </div>
            ) : (
              <>
                <Camera className="w-5 h-5 text-[#2B6BF3] stroke-[2]" />
                <span className="text-[14px] font-semibold">{label}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="mt-2 p-2.5 rounded-[10px] bg-rose-50 border border-rose-200 text-[#E5484D] text-[13px] font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
