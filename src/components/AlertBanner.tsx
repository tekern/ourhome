import React from 'react';
import { BellRing, ChevronRight, AlertTriangle } from 'lucide-react';
import { CcpTask, TaskStatus } from '../types';

interface AlertBannerProps {
  urgentTask: { task: CcpTask; status: TaskStatus } | null;
  onAction: (task: CcpTask) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ urgentTask, onAction }) => {
  if (!urgentTask) return null;

  const { task, status } = urgentTask;
  const isMissed = status === 'missed';

  return (
    <div
      onClick={() => onAction(task)}
      className={`mx-3.5 my-2.5 p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all active:scale-[0.98] flex items-center gap-3.5 shadow-lg ${
        isMissed
          ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
          : 'bg-[#E11D48] border-[#BE123C] text-white'
      }`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
        {isMissed ? (
          <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
        ) : (
          <BellRing className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '3s' }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-black text-[13px] uppercase tracking-wide text-white/95">
          <span>{isMissed ? '점검 시간 초과' : '필수 점검 알림'}</span>
          <span className="bg-black/25 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
            {task.scheduledTime}
          </span>
        </div>
        <p className="text-[17px] font-black text-white truncate leading-tight mt-0.5">
          {task.title} 바로 시작
        </p>
      </div>

      <div className="flex items-center gap-1 bg-white/25 hover:bg-white/35 px-3 py-2 rounded-xl text-sm font-black text-white shrink-0">
        <span>지금</span>
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </div>
    </div>
  );
};
