import React, { useState } from 'react';
import { CcpTask, InputMethod } from '../types';
import { Bluetooth, Keyboard, Camera, CheckCircle2, AlertTriangle, Delete } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { PhotoViewModal } from '../components/PhotoViewModal';

interface TempMeasureScreenProps {
  task: CcpTask;
  onComplete: (value: string, method: InputMethod, passed: boolean, photoId?: string) => void;
  onFail: (measuredValue: string, method: InputMethod, photoId?: string) => void;
}

export const TempMeasureScreen: React.FC<TempMeasureScreenProps> = ({
  task,
  onComplete,
  onFail,
}) => {
  const [method, setMethod] = useState<InputMethod>('BLE');

  const isFreezer = task.id === 'freezer';
  const standardLimit = isFreezer ? -18.0 : 5.0;

  // Temperature input states
  const [bleValue, setBleValue] = useState<number>(isFreezer ? -19.5 : 3.4);
  const [directInput, setDirectInput] = useState<string>(isFreezer ? '-19.2' : '3.6');
  const [photoValue, setPhotoValue] = useState<number>(isFreezer ? -19.0 : 3.8);
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);

  let currentNum = 0;
  let formattedDisplay = '';

  if (method === 'BLE') {
    currentNum = bleValue;
    formattedDisplay = `${currentNum > 0 ? '+' : ''}${currentNum.toFixed(1)}`;
  } else if (method === 'DIRECT') {
    const parsed = parseFloat(directInput);
    currentNum = isNaN(parsed) ? 0 : parsed;
    formattedDisplay = directInput || '0.0';
  } else {
    currentNum = photoValue;
    formattedDisplay = `${currentNum > 0 ? '+' : ''}${currentNum.toFixed(1)}`;
  }

  const isPassed = currentNum <= standardLimit;

  // Keypad handlers for direct input
  const handleKeypadPress = (val: string) => {
    if (val === 'BS') {
      setDirectInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '-') {
      setDirectInput((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    } else if (val === '.') {
      if (!directInput.includes('.')) {
        setDirectInput((prev) => prev + '.');
      }
    } else {
      setDirectInput((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleFinish = () => {
    const finalVal = `${formattedDisplay}℃`;
    if (isPassed) {
      onComplete(finalVal, method, true, photoId);
    } else {
      onFail(finalVal, method, photoId);
    }
  };

  const isPhotoMethodReady = method !== 'PHOTO' || Boolean(photoId);

  // 기준 범위 가로 막대 계산
  // 냉장: -2℃ ~ 12℃ (기준: 5℃)
  // 냉동: -30℃ ~ -10℃ (기준: -18℃)
  const minRange = isFreezer ? -30 : -2;
  const maxRange = isFreezer ? -10 : 12;
  const thresholdPercent = Math.max(0, Math.min(100, ((standardLimit - minRange) / (maxRange - minRange)) * 100));
  const dotPercent = Math.max(0, Math.min(100, ((currentNum - minRange) / (maxRange - minRange)) * 100));

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB]">
        {/* Header Title & Standard */}
        <div className="bg-white rounded-[18px] p-4.5 mb-3.5 border border-[#E8F0FE] flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-[#1B2333] tracking-tight">{task.title}</h2>
          <span className="text-[16px] font-bold text-[#2B6BF3] bg-[#E8F0FE] px-3.5 py-1.5 rounded-[10px]">
            {task.standardDesc}
          </span>
        </div>

        {/* 1. 입력 방식 탭 3개 세그먼트 컨트롤: 자동 연결 / 직접 입력 / 사진 찍기 */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white rounded-[16px] mb-3.5 border border-[#E8F0FE]">
          <button
            onClick={() => setMethod('BLE')}
            className={`py-2.5 rounded-[12px] text-[15px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              method === 'BLE'
                ? 'bg-[#2B6BF3] text-white font-bold shadow-xs'
                : 'text-[#64748B] font-semibold hover:text-[#1B2333]'
            }`}
          >
            <Bluetooth className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>자동 연결</span>
          </button>

          <button
            onClick={() => setMethod('DIRECT')}
            className={`py-2.5 rounded-[12px] text-[15px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              method === 'DIRECT'
                ? 'bg-[#2B6BF3] text-white font-bold shadow-xs'
                : 'text-[#64748B] font-semibold hover:text-[#1B2333]'
            }`}
          >
            <Keyboard className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>직접 입력</span>
          </button>

          <button
            onClick={() => setMethod('PHOTO')}
            className={`py-2.5 rounded-[12px] text-[15px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
              method === 'PHOTO'
                ? 'bg-[#2B6BF3] text-white font-bold shadow-xs'
                : 'text-[#64748B] font-semibold hover:text-[#1B2333]'
            }`}
          >
            <Camera className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>사진 찍기</span>
          </button>
        </div>

        {/* 2. 중앙 측정값 카드 (흰색 카드, 모서리 18px, 측정 숫자 64px) */}
        <div className="bg-white rounded-[18px] p-5 mb-3.5 border border-[#E8F0FE] flex flex-col items-center">
          {/* 측정 숫자 64px tabular-nums */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span
              className={`text-[64px] font-black tabular-nums tracking-tight leading-none ${
                isPassed ? 'text-[#1B2333]' : 'text-[#E5484D]'
              }`}
            >
              {formattedDisplay}
            </span>
            <span className="text-[32px] font-extrabold text-[#64748B]">℃</span>
          </div>

          {/* 판정: 큰 아이콘과 문구 */}
          <div className="flex items-center gap-2 mb-3 mt-1">
            {isPassed ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-[#16A34A] stroke-[2.4]" />
                <span className="text-[20px] font-bold text-[#16A34A]">적합이에요</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-[#E5484D] stroke-[2.4]" />
                <span className="text-[20px] font-bold text-[#E5484D]">부적합이에요</span>
              </>
            )}
          </div>

          {/* 3. 기준 범위 가로 막대와 현재 값 점 */}
          <div className="w-full pt-1">
            <div className="flex items-center justify-between text-[14px] font-semibold text-[#64748B] mb-1.5">
              <span>{minRange}℃</span>
              <span className="text-[#2B6BF3] font-bold">{task.standardDesc}</span>
              <span>{maxRange}℃</span>
            </div>

            {/* 가로 막대 트랙 */}
            <div className="relative w-full h-3.5 bg-[#E8F0FE] rounded-full overflow-hidden">
              {/* 적합 영역 */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#BCD0F7]"
                style={{ width: `${thresholdPercent}%` }}
              />
              {/* 부적합 영역 경계선 */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#64748B]"
                style={{ left: `${thresholdPercent}%` }}
              />
            </div>

            {/* 현재 값 위치 점 */}
            <div className="relative w-full h-5 -mt-4.5 pointer-events-none">
              <div
                className={`absolute top-0 w-5 h-5 rounded-full border-2 border-white transition-all duration-300 -ml-2.5 shadow-xs ${
                  isPassed ? 'bg-[#16A34A]' : 'bg-[#E5484D]'
                }`}
                style={{ left: `${dotPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. 세그먼트별 입력 도구 영역 */}
        <div className="bg-white rounded-[18px] p-4 border border-[#E8F0FE]">
          {method === 'BLE' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setBleValue(isFreezer ? -19.4 : 3.4)}
                  className={`flex-1 py-3.5 rounded-[12px] text-[15px] font-bold border transition cursor-pointer ${
                    isPassed
                      ? 'bg-[#E8F0FE] text-[#1F52C9] border-[#BCD0F7] shadow-xs'
                      : 'bg-white text-[#64748B] border-slate-200'
                  }`}
                >
                  적합값 ({isFreezer ? '-19.4℃' : '3.4℃'})
                </button>
                <button
                  onClick={() => setBleValue(isFreezer ? -14.2 : 8.2)}
                  className={`flex-1 py-3.5 rounded-[12px] text-[15px] font-bold border transition cursor-pointer ${
                    !isPassed
                      ? 'bg-rose-50 text-[#E5484D] border-rose-200 shadow-xs'
                      : 'bg-white text-[#64748B] border-slate-200'
                  }`}
                >
                  기준 초과 ({isFreezer ? '-14.2℃' : '8.2℃'})
                </button>
              </div>
            </div>
          )}

          {method === 'DIRECT' && (
            <div className="grid grid-cols-4 gap-2 p-1 bg-[#F5F7FB] rounded-[16px]">
              {['1', '2', '3', '-'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className="h-13 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-[12px] font-extrabold text-[22px] text-[#1B2333] border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  {k}
                </button>
              ))}
              {['4', '5', '6', '.'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className="h-13 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-[12px] font-extrabold text-[22px] text-[#1B2333] border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  {k}
                </button>
              ))}
              {['7', '8', '9', '0'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className="h-13 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-[12px] font-extrabold text-[22px] text-[#1B2333] border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  {k}
                </button>
              ))}
              <div className="col-span-4 flex gap-2 mt-1">
                <button
                  onClick={() => setDirectInput(isFreezer ? '-19.2' : '3.6')}
                  className="flex-1 h-11 bg-[#E8F0FE] hover:bg-[#d8e7fe] rounded-[10px] text-[14px] font-bold text-[#1F52C9] cursor-pointer"
                >
                  적합값 입력
                </button>
                <button
                  onClick={() => setDirectInput(isFreezer ? '-13.5' : '7.8')}
                  className="flex-1 h-11 bg-rose-50 hover:bg-rose-100 rounded-[10px] text-[14px] font-bold text-[#E5484D] cursor-pointer"
                >
                  부적합 입력
                </button>
                <button
                  onClick={() => handleKeypadPress('BS')}
                  className="w-16 h-11 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-[10px] flex items-center justify-center text-[#1B2333] cursor-pointer"
                >
                  <Delete className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          )}

          {method === 'PHOTO' && (
            <div className="flex flex-col gap-3">
              <CameraCapture
                photoId={photoId}
                label="온도계 사진 찍기"
                onPhotoCaptured={(id) => {
                  setPhotoId(id);
                }}
                onViewPhoto={(url) => setModalPhotoUrl(url)}
              />

              <div className="flex gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoValue(isFreezer ? -19.0 : 3.8);
                  }}
                  className="flex-1 py-2.5 bg-[#E8F0FE] hover:bg-[#d8e7fe] text-[#1F52C9] font-bold text-[14px] rounded-[10px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>적합 수치 (3.8℃)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoValue(isFreezer ? -13.0 : 8.5);
                  }}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#E5484D] font-bold text-[14px] rounded-[10px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>초과 수치 (8.5℃)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoViewModal
        isOpen={Boolean(modalPhotoUrl)}
        photoUrl={modalPhotoUrl}
        title={`${task.title} 사진`}
        onClose={() => setModalPhotoUrl(null)}
      />

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        {!isPhotoMethodReady ? (
          <button
            disabled
            className="w-full h-15 bg-[#E3EAF8] text-[#9FB0D4] font-bold text-[18px] rounded-[16px] cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5 stroke-[2.2]" />
            <span>사진 찍기</span>
          </button>
        ) : isPassed ? (
          <button
            onClick={handleFinish}
            className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            <span>완료할게요</span>
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full h-15 bg-[#E5484D] hover:opacity-90 active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <span>이상 조치하기</span>
          </button>
        )}
      </div>
    </div>
  );
};
