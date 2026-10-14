import React from 'react';
import { CcpTask, TaskStatus } from '../types';
import { getTaskStatus } from '../utils/storage';
import { Check, QrCode, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';

interface HomeScreenProps {
  tasks: CcpTask[];
  virtualTimeMinutes: number;
  atpCompletedThisWeek: boolean;
  onSelectTask: (task: CcpTask) => void;
  onOpenAtp: () => void;
  onOpenAdmin?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  virtualTimeMinutes,
  atpCompletedThisWeek,
  onSelectTask,
  onOpenAtp,
  onOpenAdmin,
}) => {
  const completedCount = tasks.filter((t) => t.completedAt).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const taskStatuses = tasks.map((task) => ({
    task,
    status: getTaskStatus(task, virtualTimeMinutes),
  }));

  const urgentTask =
    taskStatuses.find((t) => t.status === 'current') ||
    taskStatuses.find((t) => t.status === 'missed') ||
    taskStatuses.find((t) => t.status === 'waiting');

  const allCompleted = completedCount === totalCount;

  return (
    <div className="flex-1 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] pt-5 px-4.5 pb-4 select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 1. Section Header: Pillyze style "잊지말고 점검하세요 ⏰" */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[22px] font-black tracking-tight text-[#111827]">
              잊지말고 점검하세요
            </h2>
            <span className="text-xl">⏰</span>
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-bold text-sm cursor-pointer active:scale-95 transition"
          >
            <span>오늘 CCP</span>
            <span className="text-[#1C2B4A] font-black">{completedCount}/{totalCount}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* High contrast slim progress line */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              allCompleted ? 'bg-emerald-500' : 'bg-[#1C2B4A]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Tasks List in Pillyze Card Aesthetic */}
      <div className="flex flex-col gap-3 my-auto">
        {taskStatuses.map(({ task, status }) => {
          const isDone = status === 'completed';
          const isCurrent = status === 'current';
          const isMissed = status === 'missed';

          // Friendly Korean time label
          const timeLabel =
            task.hour < 12
              ? `오전 ${String(task.hour).padStart(2, '0')}:${String(task.minute).padStart(2, '0')}`
              : `오후 ${String(task.hour === 12 ? 12 : task.hour - 12).padStart(2, '0')}:${String(task.minute).padStart(2, '0')}`;

          return (
            <div key={task.id} className="space-y-1">
              {/* Group time header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-slate-600">
                  {timeLabel} 필수
                </span>
                {isCurrent && (
                  <span className="text-[12px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                    지금 점검 시간
                  </span>
                )}
                {isMissed && (
                  <span className="text-[12px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    미체크 경고
                  </span>
                )}
              </div>

              {/* Card Container */}
              <div
                onClick={() => onSelectTask(task)}
                className={`p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-[#FFF5F5] border-rose-400 ring-2 ring-rose-200 shadow-sm'
                    : isMissed
                    ? 'bg-[#FFFBEB] border-amber-300'
                    : isDone
                    ? 'bg-[#F0FDF4] border-emerald-200'
                    : 'bg-[#F1F3FB] border-slate-200/60 hover:bg-[#E8EDF9]'
                }`}
              >
                {/* Left Text: Big & High Contrast for Seniors */}
                <div className="min-w-0 pr-3">
                  <h3 className="text-[20px] font-black text-[#111827] tracking-tight leading-snug truncate">
                    {task.title}
                  </h3>
                  <p className="text-[15px] font-bold text-slate-700 mt-0.5 truncate">
                    {task.completedValue ? (
                      <span className="text-emerald-800 font-extrabold">
                        {task.completedValue} ({task.completedMethod})
                      </span>
                    ) : (
                      <span>기준: {task.standardDesc}</span>
                    )}
                  </p>
                </div>

                {/* Right Circle Checkbox (Exactly like Pillyze) */}
                <div className="shrink-0">
                  {isDone ? (
                    <div className="w-10 h-10 rounded-full bg-[#1C2B4A] flex items-center justify-center text-white shadow-sm">
                      <Check className="w-6 h-6 stroke-[3.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white ring-4 ring-rose-200 shadow-md">
                      <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  ) : isMissed ? (
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white ring-4 ring-amber-100">
                      <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  ) : (
                    // Pillyze style dashed circle for waiting
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C7D2FE] bg-white/80 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#C7D2FE] stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. ATP Weekly Hygiene Row */}
        <div
          onClick={onOpenAtp}
          className="mt-0.5 p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 active:scale-[0.98] transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[17px] font-black text-[#111827] leading-tight">
                청결 검증 · ATP 주 1회
              </h4>
              <p className="text-[13px] font-bold text-slate-700 leading-none mt-0.5">
                {atpCompletedThisWeek ? '이번 주 적합 완료' : '이번 주 미측정 (탭하여 측정)'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            {atpCompletedThisWeek ? (
              <span className="text-[12px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                완료됨
              </span>
            ) : (
              <span className="text-[12px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                측정하기
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4. Bottom Main Action Button: Massive, Bold & High Contrast */}
      <div className="pt-2">
        {allCompleted ? (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-[20px] rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Check className="w-7 h-7 stroke-[3]" />
            <span>오늘 점검 전원 완료 (재확인)</span>
          </button>
        ) : (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-16 bg-[#1C2B4A] hover:bg-[#142038] active:scale-[0.98] text-white font-black text-[20px] rounded-2xl shadow-xl shadow-[#1C2B4A]/25 transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <QrCode className="w-7 h-7 text-amber-300 stroke-[2.5]" />
            <span>
              {urgentTask?.status === 'current'
                ? `[${urgentTask.task.scheduledTime}] QR 찍고 시작`
                : urgentTask?.status === 'missed'
                ? `[미체크] ${urgentTask.task.title} 시작`
                : 'QR 찍고 점검 시작'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
