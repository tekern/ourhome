import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Bell, Clock, RotateCcw } from 'lucide-react';
import { ScreenType } from '../types';

interface TopHeaderProps {
  currentScreen: ScreenType;
  virtualTime: string;
  urgentCount: number;
  onAdvanceTime: () => void;
  onResetData?: () => void;
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentScreen,
  virtualTime,
  urgentCount,
  onAdvanceTime,
  onResetData,
  onNavigate,
  onBack,
}) => {
  return (
    <header
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      className="shrink-0 bg-[#2B6BF3] text-white px-5 pb-4 z-20 select-none"
    >
      {/* Discreet System Status Bar */}
      <div className="flex items-center justify-between text-xs text-white/80 pb-2.5 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tabular-nums text-sm">{virtualTime}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Reset button for taking fresh screenshots */}
          {onResetData && (
            <button
              onClick={onResetData}
              title="측정 결과 데이터 초기화 (처음 상태로)"
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full transition-transform cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}

          {/* Quick Demo +30m button */}
          <button
            onClick={onAdvanceTime}
            title="가상 시간을 30분 앞으로 진행"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full transition-transform cursor-pointer"
          >
            <Clock className="w-3 h-3" />
            <span>데모 +30분</span>
          </button>

          <div className="flex items-center gap-1.5 text-white/80">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Title Bar: Left Store Name ONLY, Right Bell Icon ONLY */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          {onBack && currentScreen !== 'HOME' ? (
            <button
              onClick={onBack}
              aria-label="이전 화면으로 돌아가기"
              className="p-1 -ml-1 text-white hover:text-white/80 active:scale-95 transition-transform cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          ) : null}
          <h1 className="text-[24px] font-bold tracking-tight text-white leading-none">
            강남 본점
          </h1>
        </div>

        {/* Bell Icon ONLY */}
        <button
          onClick={() => onNavigate(currentScreen === 'ADMIN' ? 'HOME' : 'ADMIN')}
          aria-label="알림 및 관제 보기"
          className="relative p-1.5 text-white hover:text-white/80 active:scale-95 transition-transform cursor-pointer"
        >
          <Bell className="w-6 h-6 stroke-[2]" />
          {urgentCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E5484D] rounded-full ring-2 ring-[#2B6BF3]" />
          )}
        </button>
      </div>
    </header>
  );
};
