import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Bell, Clock } from 'lucide-react';
import { ScreenType } from '../types';

interface TopHeaderProps {
  currentScreen: ScreenType;
  virtualTime: string;
  urgentCount: number;
  onAdvanceTime: () => void;
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentScreen,
  virtualTime,
  urgentCount,
  onAdvanceTime,
  onNavigate,
  onBack,
}) => {
  return (
    <header className="shrink-0 bg-[#16233B] text-white pt-2.5 px-5 pb-5 z-20 select-none">
      {/* Discreet System Status Bar */}
      <div className="flex items-center justify-between text-xs text-white/70 pb-3 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tabular-nums text-sm">{virtualTime}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Demo +30m button */}
          <button
            onClick={onAdvanceTime}
            title="가상 시간을 30분 앞으로 진행"
            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#16233B] text-[11px] font-black px-2 py-0.5 rounded-full shadow transition-transform cursor-pointer"
          >
            <Clock className="w-3 h-3" />
            <span>+30분</span>
          </button>

          <div className="flex items-center gap-1.5 text-white/80">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Clean Main Title Bar: Left Store Name ONLY, Right Bell Icon ONLY */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Store Name ONLY */}
        <div className="flex items-center gap-2">
          {onBack && currentScreen !== 'HOME' ? (
            <button
              onClick={onBack}
              aria-label="이전 화면으로 돌아가기"
              className="p-1 -ml-1 text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
          ) : null}
          <h1 className="text-2xl font-black tracking-tight text-white leading-none">
            강남 본점
          </h1>
        </div>

        {/* Right: Bell Icon ONLY */}
        <button
          onClick={() => onNavigate(currentScreen === 'ADMIN' ? 'HOME' : 'ADMIN')}
          aria-label="알림 및 관제 보기"
          className="relative p-2 text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer"
        >
          <Bell className="w-6 h-6 stroke-[2.2]" />
          {urgentCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#16233B] animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
