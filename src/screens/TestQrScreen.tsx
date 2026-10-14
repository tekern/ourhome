import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, QrCode, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';
import { OFFICIAL_QR_SPOTS, QrSpotInfo } from '../utils/qrConstants';

interface TestQrScreenProps {
  onBack: () => void;
}

export const TestQrScreen: React.FC<TestQrScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'ALL' | 'CCP' | 'ATP'>('ALL');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generate QR code Data URLs
  useEffect(() => {
    let isMounted = true;

    async function generateAllQrs() {
      const generated: Record<string, string> = {};
      for (const spot of OFFICIAL_QR_SPOTS) {
        try {
          const url = await QRCode.toDataURL(spot.rawPayload, {
            width: 260,
            margin: 2,
            color: {
              dark: '#1B2333',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
          });
          generated[spot.code] = url;
        } catch (err) {
          console.error(`Failed to generate QR for ${spot.code}`, err);
        }
      }
      if (isMounted) {
        setQrImages(generated);
      }
    }

    generateAllQrs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSpots = OFFICIAL_QR_SPOTS.filter((s) => {
    if (filter === 'ALL') return true;
    return s.category === filter;
  });

  const handleCopy = (payload: string, code: string) => {
    navigator.clipboard?.writeText(payload);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB]">
        {/* Top Header Card */}
        <div className="bg-white rounded-[16px] p-4 mb-3 border border-[#E8F0FE]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#E8F0FE] flex items-center justify-center text-[#2B6BF3]">
                <QrCode className="w-4 h-4" />
              </div>
              <h2 className="text-[18px] font-bold text-[#1B2333]">현장 테스트용 QR 코드</h2>
            </div>
            <span className="text-[12px] font-semibold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
              총 7개 지점
            </span>
          </div>
          <p className="text-[13px] text-[#6B7690] mt-1 leading-snug">
            PC 화면에 이 QR 코드를 띄워두고, 스마트폰 카메라로 비춰서 실제 스캔을 테스트해보세요.
          </p>

          {/* Filter Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F7FB] rounded-[12px] mt-3">
            {[
              { id: 'ALL', label: '전체 (7)' },
              { id: 'CCP', label: 'CCP 필수 (3)' },
              { id: 'ATP', label: '청결도 ATP (4)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`py-1.5 rounded-[9px] text-[13px] font-semibold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-[#2B6BF3] shadow-xs'
                    : 'text-[#6B7690] hover:text-[#1B2333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Cards Grid */}
        <div className="flex flex-col gap-3.5">
          {filteredSpots.map((spot) => {
            const qrUrl = qrImages[spot.code];
            const isCopied = copiedCode === spot.code;

            return (
              <div
                key={spot.code}
                className="bg-white rounded-[20px] p-4 border border-[#E8F0FE] flex flex-col items-center text-center shadow-xs"
              >
                {/* Spot Title & Category Badge */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-[6px] ${
                      spot.category === 'CCP'
                        ? 'bg-[#E8F0FE] text-[#2B6BF3]'
                        : 'bg-emerald-50 text-[#22A06B]'
                    }`}
                  >
                    {spot.category === 'CCP' ? 'CCP 필수' : 'ATP 주간 검증'}
                  </span>
                  <span className="text-[12px] font-mono text-[#6B7690] font-semibold">
                    {spot.code}
                  </span>
                </div>

                <h3 className="text-[18px] font-bold text-[#1B2333] mb-0.5">
                  {spot.name}
                </h3>
                <p className="text-[13px] text-[#6B7690] mb-3">
                  {spot.detail}
                </p>

                {/* Big QR Image Display */}
                <div className="w-48 h-48 rounded-[16px] bg-white border-2 border-[#E8F0FE] p-2 flex items-center justify-center shadow-xs">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt={`${spot.name} QR`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 border-3 border-[#2B6BF3] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Raw Value Payload Bar */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] font-mono font-medium text-[#6B7690] bg-[#F5F7FB] px-2.5 py-1 rounded-[8px] truncate max-w-[200px]">
                    {spot.rawPayload}
                  </span>

                  <button
                    onClick={() => handleCopy(spot.rawPayload, spot.code)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#2B6BF3] hover:text-[#1F52C9] bg-[#E8F0FE] px-2.5 py-1 rounded-[8px] transition cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>값 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        <button
          onClick={onBack}
          className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          <span>관리자 화면으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
};
