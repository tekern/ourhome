import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, AlertCircle, RefreshCw, QrCode } from 'lucide-react';
import { parseShygQr, getSpotNameByCode } from '../utils/qrConstants';

interface QrCameraScannerProps {
  expectedCode: string; // e.g. "FRIDGE-01"
  expectedSpotName: string; // e.g. "냉장고"
  onScanSuccess: (code: string) => void;
  onFallbackDemo: () => void;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  expectedCode,
  expectedSpotName,
  onScanSuccess,
  onFallbackDemo,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // QR scanning loop using requestAnimationFrame and jsQR
  const startScanLoop = useCallback(() => {
    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            const rawData = qrCode.data.trim();
            const parsedCode = parseShygQr(rawData);

            if (parsedCode) {
              // Valid SHYG QR
              if (parsedCode.toUpperCase() === expectedCode.toUpperCase()) {
                // Correct spot match!
                stopCameraStream();
                onScanSuccess(parsedCode);
                return;
              } else {
                // Wrong spot!
                const scannedSpotName = getSpotNameByCode(parsedCode);
                setWarningMessage(
                  `다른 곳이에요. [${expectedSpotName}]의 QR을 찍어주세요 (인식된 곳: ${scannedSpotName})`
                );
              }
            } else if (rawData.toUpperCase() === expectedCode.toUpperCase()) {
              // If user made a code without SHYG: prefix
              stopCameraStream();
              onScanSuccess(rawData);
              return;
            } else {
              setWarningMessage(`다른 곳이에요. [${expectedSpotName}]의 QR을 찍어주세요`);
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scan);
    };

    animFrameIdRef.current = requestAnimationFrame(scan);
  }, [expectedCode, expectedSpotName, onScanSuccess, stopCameraStream]);

  // Start real camera stream
  const startCamera = useCallback(async () => {
    setHasCameraError(false);
    setErrorMessage(null);
    setWarningMessage(null);

    // Stop any existing stream
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraError(true);
      setErrorMessage('카메라를 쓸 수 없어요');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanLoop();
      }
    } catch (err: any) {
      console.warn('Camera stream error or permission denied:', err);
      setHasCameraError(true);
      setErrorMessage('카메라를 쓸 수 없어요');
      setIsCameraActive(false);
    }
  }, [startScanLoop, stopCameraStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
    };
  }, [startCamera, stopCameraStream]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Offscreen canvas used for jsQR image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewport / Guide Container */}
      <div className="relative w-64 h-64 bg-slate-900 rounded-[24px] overflow-hidden shadow-md flex items-center justify-center border-2 border-[#2B6BF3]">
        {isCameraActive && !hasCameraError ? (
          <>
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark overlay with transparent center square guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Center 180x180 square guide */}
              <div className="relative w-44 h-44 border-2 border-white/60 rounded-[16px]">
                {/* 4 Corner highlights in #2B6BF3 */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#2B6BF3] rounded-tl-[8px]" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#2B6BF3] rounded-tr-[8px]" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#2B6BF3] rounded-bl-[8px]" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#2B6BF3] rounded-br-[8px]" />

                {/* Animated horizontal scanning bar */}
                <div className="w-full h-0.5 bg-[#2B6BF3] shadow-[0_0_8px_#2B6BF3] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Target indicator badge */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[12px] font-medium py-1 px-2.5 rounded-full text-center truncate">
              {expectedSpotName} ({expectedCode}) QR 코드를 비춰주세요
            </div>
          </>
        ) : (
          // Camera Not Available / Denied Fallback View
          <div className="flex flex-col items-center justify-center p-5 text-center text-white">
            <Camera className="w-12 h-12 text-slate-400 mb-2 stroke-[1.5]" />
            <span className="text-[15px] font-bold text-white mb-1">
              카메라를 쓸 수 없어요
            </span>
            <span className="text-[12px] text-slate-300 max-w-[200px] leading-tight mb-3">
              권한이 없거나 지원되지 않는 환경이에요. 아래 데모 버튼으로 바로 진행할 수 있어요.
            </span>
            <button
              onClick={startCamera}
              className="flex items-center gap-1 text-[12px] text-white/90 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>카메라 다시 시도</span>
            </button>
          </div>
        )}
      </div>

      {/* Warning Notification: When wrong QR code is scanned */}
      {warningMessage && (
        <div className="w-full max-w-xs mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-[12px] text-amber-800 text-[13px] font-semibold flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#F08A24] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{warningMessage}</p>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-[11px] text-[#2B6BF3] underline mt-0.5 cursor-pointer font-bold"
            >
              다시 스캔하기
            </button>
          </div>
        </div>
      )}

      {/* Fallback Demo Button (Always available for seamless PC testing) */}
      <div className="mt-3 w-full max-w-xs flex justify-center">
        <button
          type="button"
          onClick={onFallbackDemo}
          className="text-[13px] text-[#2B6BF3] hover:text-[#1F52C9] bg-[#E8F0FE] hover:bg-[#dce9fd] active:scale-95 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>데모 인식하기 (카메라 없이 바로 통과)</span>
        </button>
      </div>
    </div>
  );
};
