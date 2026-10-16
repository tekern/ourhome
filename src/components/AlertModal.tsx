import React from 'react';
import { Bell, X } from 'lucide-react';
import { CcpTask, TaskStatus } from '../types';

interface AlertModalProps {
  urgentTask: { task: CcpTask; status: TaskStatus } | null;
  onAction: (task: CcpTask) => void;
  onClose?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ urgentTask, onAction, onClose }) => {
  if (!urgentTask) return null;

  const { task } = urgentTask;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-6 select-none animate-fadeIn cursor-pointer"
    >
      {/* 둥근 팝업 (모서리 24px) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[320px] bg-white rounded-[24px] p-6 text-center shadow-lg border border-slate-100 flex flex-col items-center cursor-default"
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="알림 닫기"
            className="absolute top-4 right-4 p-1.5 text-[#6B7690] hover:text-[#1B2333] active:scale-95 transition rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 종 아이콘 */}
        <div className="w-14 h-14 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#2B6BF3] mb-4">
          <Bell className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* 점검 시각 */}
        <span className="text-[15px] font-bold text-[#64748B] mb-1">
          {task.hour < 12
            ? `오전 ${task.hour}:${String(task.minute).padStart(2, '0')}`
            : `오후 ${task.hour === 12 ? 12 : task.hour - 12}:${String(task.minute).padStart(2, '0')}`} 점검
        </span>

        {/* 문구 */}
        <h3 className="text-[22px] font-extrabold text-[#1B2333] mb-6 leading-snug">
          {task.title} 시간이에요
        </h3>

        {/* 큰 [지금 시작] 버튼 하나 */}
        <button
          onClick={() => onAction(task)}
          className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition cursor-pointer flex items-center justify-center shadow-xs"
        >
          지금 시작
        </button>
      </div>
    </div>
  );
};
