import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
} from 'react';
import jsQR from 'jsqr';
import { Camera, AlertCircle, RefreshCw, QrCode } from 'lucide-react';
import { parseShygQr, getSpotNameByCode } from '../utils/qrConstants';

export interface QrCameraScannerRef {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

interface QrCameraScannerProps {
  expectedCode: string; // e.g. "FRIDGE-01"
  expectedSpotName: string; // e.g. "냉장고"
  onScanSuccess: (code: string) => void;
  onFallbackDemo: () => void;
  onCameraActiveChange?: (active: boolean) => void;
}

export const QrCameraScanner = React.forwardRef<QrCameraScannerRef, QrCameraScannerProps>(
  (
    {
      expectedCode,
      expectedSpotName,
      onScanSuccess,
      onFallbackDemo,
      onCameraActiveChange,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameIdRef = useRef<number | null>(null);

    // States
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // Debug status states (Requirement 6)
    // States: '대기 중' | '요청 중' | '재생 중' | '오류: [오류명]'
    const [cameraStatus, setCameraStatus] = useState<string>('대기 중');
    const [videoDimensions, setVideoDimensions] = useState<string>('0 x 0');

    // Cleanly stop camera stream and scanning loop
    const stopCameraStream = useCallback(() => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setMediaStream(null);
      setIsCameraActive(false);
      setCameraStatus('대기 중');
      setVideoDimensions('0 x 0');
      onCameraActiveChange?.(false);
    }, [onCameraActiveChange]);

    // QR scanning loop using requestAnimationFrame and jsQR (No BarcodeDetector)
    const startScanLoop = useCallback(() => {
      const scan = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && canvas) {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoDimensions(`${video.videoWidth} x ${video.videoHeight}`);

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
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
                    // Spot matched! Stop loop and stream
                    stopCameraStream();
                    onScanSuccess(parsedCode);
                    return;
                  } else {
                    // Mismatched spot
                    const scannedSpotName = getSpotNameByCode(parsedCode);
                    setWarningMessage(
                      `다른 곳이에요. [${expectedSpotName}]의 QR을 찍어주세요 (인식된 곳: ${scannedSpotName})`
                    );
                  }
                } else if (rawData.toUpperCase() === expectedCode.toUpperCase()) {
                  // Spot code without SHYG prefix
                  stopCameraStream();
                  onScanSuccess(rawData);
                  return;
                } else {
                  setWarningMessage(`다른 곳이에요. [${expectedSpotName}]의 QR을 찍어주세요`);
                }
              }
            }
          }
        }

        animFrameIdRef.current = requestAnimationFrame(scan);
      };

      animFrameIdRef.current = requestAnimationFrame(scan);
    }, [expectedCode, expectedSpotName, onScanSuccess, stopCameraStream]);

    // Call getUserMedia with { video: { facingMode: { ideal: 'environment' } }, audio: false }
    // inside a user button click event (Requirement 4)
    const handleStartCamera = useCallback(async () => {
      setCameraStatus('요청 중');
      setErrorMessage(null);
      setWarningMessage(null);

      // Stop any existing stream before starting a new one
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('오류: NotSupported');
        setErrorMessage('카메라를 쓸 수 없어요');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        streamRef.current = stream;
        setMediaStream(stream);
      } catch (err: any) {
        const errName = err?.name || 'Error';
        console.warn('getUserMedia error:', err);
        setCameraStatus(`오류: ${errName}`);
        if (errName === 'NotAllowedError') {
          setErrorMessage('카메라 권한이 거부되었어요');
        } else {
          setErrorMessage('카메라를 쓸 수 없어요');
        }
        setIsCameraActive(false);
        onCameraActiveChange?.(false);
      }
    }, [onCameraActiveChange]);

    // Expose ref methods
    useImperativeHandle(
      ref,
      () => ({
        startCamera: handleStartCamera,
        stopCamera: stopCameraStream,
      }),
      [handleStartCamera, stopCameraStream]
    );

    // Requirement 2: Attach stream to videoRef.current.srcObject in useEffect after video is rendered in DOM,
    // call await video.play(), and catch errors to display on screen
    useEffect(() => {
      if (!mediaStream) return;
      const video = videoRef.current;
      if (!video) return;

      let isCancelled = false;

      const connectAndPlay = async () => {
        try {
          // Requirement 1: set playsInline, muted, autoPlay both in JSX and via JS setAttribute
          video.setAttribute('playsinline', 'true');
          video.playsInline = true;
          video.muted = true;
          video.autoplay = true;
          video.srcObject = mediaStream;

          const handleMetadata = () => {
            if (!isCancelled && video.videoWidth > 0 && video.videoHeight > 0) {
              setVideoDimensions(`${video.videoWidth} x ${video.videoHeight}`);
            }
          };

          video.onloadedmetadata = handleMetadata;
          video.oncanplay = handleMetadata;

          await video.play();

          if (!isCancelled) {
            setIsCameraActive(true);
            setCameraStatus('재생 중');
            onCameraActiveChange?.(true);

            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setVideoDimensions(`${video.videoWidth} x ${video.videoHeight}`);
            }

            startScanLoop();
          }
        } catch (playErr: any) {
          if (!isCancelled) {
            const errName = playErr?.name || 'PlayError';
            console.error('video.play() failed:', playErr);
            setCameraStatus(`오류: ${errName}`);
            setErrorMessage(`비디오 재생 실패 (${errName})`);
            setIsCameraActive(false);
            onCameraActiveChange?.(false);
          }
        }
      };

      connectAndPlay();

      return () => {
        isCancelled = true;
      };
    }, [mediaStream, onCameraActiveChange, startScanLoop]);

    // Stop camera on unmount
    useEffect(() => {
      return () => {
        stopCameraStream();
      };
    }, [stopCameraStream]);

    return (
      <div className="w-full flex flex-col items-center">
        {/* Offscreen canvas used for jsQR */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 
          Requirement 3:
          - Video container: NO border-radius, NO overflow:hidden, NO transform, NO opacity, NO filter
          - Video itself: width:100%, height:100%, object-fit:cover, display:block, border-radius on video itself
        */}
        <div
          style={{
            position: 'relative',
            width: '256px',
            height: '256px',
            backgroundColor: '#0F172A',
            border: '2px solid #2B6BF3',
          }}
        >
          {/* <video> element with playsInline, muted, autoPlay (Requirement 1 & 3) */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '24px',
            }}
          />

          {/* Guide Overlay when camera is active (no transform, no opacity, no filter) */}
          {isCameraActive && (
            <>
              {/* Center 176x176 square guide without transform or opacity */}
              <div
                style={{
                  position: 'absolute',
                  top: '38px',
                  left: '38px',
                  width: '176px',
                  height: '176px',
                  border: '2px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                }}
              >
                {/* 4 Corner highlights in #2B6BF3 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '4px solid #2B6BF3',
                    borderLeft: '4px solid #2B6BF3',
                    borderTopLeftRadius: '8px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '4px solid #2B6BF3',
                    borderRight: '4px solid #2B6BF3',
                    borderTopRightRadius: '8px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '4px solid #2B6BF3',
                    borderLeft: '4px solid #2B6BF3',
                    borderBottomLeftRadius: '8px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '4px solid #2B6BF3',
                    borderRight: '4px solid #2B6BF3',
                    borderBottomRightRadius: '8px',
                  }}
                />

                {/* Center scan line without opacity animation or transform */}
                <div
                  style={{
                    position: 'absolute',
                    top: '86px',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#2B6BF3',
                  }}
                />
              </div>

              {/* Target indicator badge without filter */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  pointerEvents: 'none',
                }}
              >
                {expectedSpotName} ({expectedCode}) QR을 비춰주세요
              </div>
            </>
          )}

          {/* Placeholder / Action Overlay when camera is not running */}
          {!isCameraActive && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#0F172A',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              <Camera className="w-12 h-12 text-slate-400 mb-2 stroke-[1.5]" />
              <span className="text-[15px] font-bold text-white mb-1">
                {errorMessage || '카메라를 켜주세요'}
              </span>
              <p className="text-[12px] text-slate-300 max-w-[200px] leading-tight mb-3">
                {errorMessage
                  ? '다시 시도하거나 데모 버튼으로 바로 진행할 수 있어요.'
                  : '아래 버튼을 눌러 카메라를 켜고 QR 코드를 비춰주세요.'}
              </p>
              <button
                type="button"
                onClick={handleStartCamera}
                className="flex items-center gap-1.5 text-[14px] font-semibold text-white bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] px-4 py-2 rounded-[12px] transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{errorMessage ? '카메라 다시 시도' : '카메라 켜기'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* [DEBUG] 카메라 상태 디버그 문구 (Requirement 6 - 문제 해결 시 이 블록만 삭제 가능) */}
        {/* ================================================================= */}
        <div className="mt-2 w-64 px-3 py-1.5 bg-[#F5F7FB] border border-[#BCD0F7] rounded-[8px] text-[11px] font-mono text-[#1F52C9] flex items-center justify-between">
          <span>카메라: {cameraStatus}</span>
          <span>영상: {videoDimensions}</span>
        </div>
        {/* ================================================================= */}

        {/* Warning Notification: When wrong QR code is scanned */}
        {warningMessage && (
          <div className="w-full max-w-xs mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-[12px] text-amber-800 text-[13px] font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#F08A24] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{warningMessage}</p>
              <button
                type="button"
                onClick={() => setWarningMessage(null)}
                className="text-[11px] text-[#2B6BF3] underline mt-0.5 cursor-pointer font-bold"
              >
                다시 스캔하기
              </button>
            </div>
          </div>
        )}

        {/* Fallback Demo Button (Always available for seamless PC testing) */}
        <div className="mt-2.5 w-full max-w-xs flex justify-center">
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
  }
);
QrCameraScanner.displayName = 'QrCameraScanner';
