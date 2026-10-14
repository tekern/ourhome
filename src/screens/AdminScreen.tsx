import React from 'react';
import { CcpTask, InspectionRecord, BranchPerformance } from '../types';
import { getBranchData } from '../utils/storage';
import { ShieldCheck, RotateCcw, Building2 } from 'lucide-react';

interface AdminScreenProps {
  tasks: CcpTask[];
  records: InspectionRecord[];
  onReturnToHome: () => void;
  onResetData: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  tasks,
  records,
  onReturnToHome,
  onResetData,
}) => {
  const completedCount = tasks.filter((t) => t.completedAt).length;
  const totalTasks = tasks.length;
  const currentStoreRate = Math.round((completedCount / totalTasks) * 100);
  const missedCount = tasks.filter((t) => !t.completedAt).length;
  const anomalyCount = records.filter((r) => r.anomaly).length;

  const branchList: BranchPerformance[] = getBranchData(
    currentStoreRate,
    missedCount,
    anomalyCount
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[32px] select-none overflow-hidden shadow-[0_-10px_25px_rgba(0,0,0,0.06)]">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#1C2B4A]">
              <Building2 className="w-5 h-5 text-indigo-700" />
            </div>
            <h2 className="text-[20px] font-black text-[#111827]">전 점포 CCP 관제 현황</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            실시간
          </span>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Card 1: 수행률 */}
          <div className="bg-[#F1F3FB] p-3 rounded-2xl border border-slate-200/60 text-center">
            <span className="text-[12px] font-bold text-slate-500 block">당점 수행률</span>
            <span className="text-2xl font-black text-[#111827] tabular-nums mt-0.5 block">
              {currentStoreRate}%
            </span>
            <span className="text-[11px] text-indigo-700 font-extrabold block mt-0.5">
              {completedCount}/{totalTasks} 건
            </span>
          </div>

          {/* Card 2: 미수행 건수 */}
          <div className="bg-[#F1F3FB] p-3 rounded-2xl border border-slate-200/60 text-center">
            <span className="text-[12px] font-bold text-slate-500 block">미수행</span>
            <span
              className={`text-2xl font-black tabular-nums mt-0.5 block ${
                missedCount > 0 ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {missedCount}건
            </span>
            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
              {missedCount === 0 ? '완료' : '점검 대기'}
            </span>
          </div>

          {/* Card 3: 이상 건수 */}
          <div className="bg-[#F1F3FB] p-3 rounded-2xl border border-slate-200/60 text-center">
            <span className="text-[12px] font-bold text-slate-500 block">이상/조치</span>
            <span
              className={`text-2xl font-black tabular-nums mt-0.5 block ${
                anomalyCount > 0 ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {anomalyCount}건
            </span>
            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
              {anomalyCount > 0 ? '조치완료' : '정상'}
            </span>
          </div>
        </div>

        {/* 5 Branch Stores List (80% 미만은 주황색 표시) */}
        <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200 mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-black text-slate-800">지점별 CCP 필수 수행률 (5개 점포)</h3>
            <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-black">
              80% 미만 경고
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {branchList.map((branch) => {
              const isWarning = branch.rate < 80;
              return (
                <div key={branch.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`font-black truncate ${
                        branch.isCurrentStore
                          ? 'text-[#1C2B4A] flex items-center gap-1.5'
                          : 'text-slate-700'
                      }`}
                    >
                      {branch.name}
                      {branch.isCurrentStore && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
                          현재점포
                        </span>
                      )}
                    </span>

                    <span
                      className={`font-black tabular-nums text-base ${
                        isWarning ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {branch.rate}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isWarning ? 'bg-amber-500' : 'bg-[#1C2B4A]'
                      }`}
                      style={{ width: `${branch.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Inspection History Log */}
        <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200">
          <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center justify-between">
            <span>오늘 현장 점검 실시간 기록</span>
            <span className="text-xs text-slate-500 font-bold">{records.length}건 기록</span>
          </h3>

          {records.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              아직 완료된 점검 기록이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm truncate">
                        {rec.taskTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        {rec.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-slate-700 text-xs font-semibold">
                      <span className="font-black text-emerald-700 text-sm">{rec.value}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                        {rec.method === 'BLE'
                          ? '자동(BLE)'
                          : rec.method === 'DIRECT'
                          ? '직접입력'
                          : '사진촬영'}
                      </span>
                    </div>

                    {rec.anomaly && (
                      <div className="mt-1.5 text-xs font-black text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        1차 {rec.anomaly.initialValue} 이탈 → [{rec.anomaly.action}] 조치 후 재측정 {rec.anomaly.recheckValue} 적합
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      적합
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 영역 */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10 flex gap-2"
      >
        <button
          onClick={onResetData}
          className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-sm rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition border border-slate-200"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>시연 데이터 초기화</span>
        </button>

        <button
          onClick={onReturnToHome}
          className="flex-1 h-14 bg-[#1C2B4A] hover:bg-[#142038] active:scale-95 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-[#1C2B4A]/25"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>현장 점검 복귀</span>
        </button>
      </div>
    </div>
  );
};
