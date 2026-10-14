import React from 'react';
import { CcpTask, InspectionRecord, BranchPerformance } from '../types';
import { getBranchData } from '../utils/storage';
import { ShieldCheck, RotateCcw, Building2, Check } from 'lucide-react';

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
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4.5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB]">
        {/* Title */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#E8F0FE] flex items-center justify-center text-[#2B6BF3]">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-[20px] font-bold text-[#1B2333]">점포별 점검 현황</h2>
          </div>
          <span className="text-[12px] font-medium text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
            실시간
          </span>
        </div>

        {/* 3 KPI Cards: 흰색, 모서리 16px, 그림자 없음 */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {/* Card 1: 수행률 */}
          <div className="bg-white p-3 rounded-[16px] border border-[#E8F0FE] text-center">
            <span className="text-[12px] font-medium text-[#6B7690] block">우리 점포</span>
            <span className="text-[22px] font-bold text-[#2B6BF3] tabular-nums mt-0.5 block">
              {currentStoreRate}%
            </span>
            <span className="text-[11px] text-[#6B7690] font-medium block mt-0.5">
              {completedCount}/{totalTasks}건 완료
            </span>
          </div>

          {/* Card 2: 미체크 (관리자 화면은 미체크 유지) */}
          <div className="bg-white p-3 rounded-[16px] border border-[#E8F0FE] text-center">
            <span className="text-[12px] font-medium text-[#6B7690] block">미체크</span>
            <span
              className={`text-[22px] font-bold tabular-nums mt-0.5 block ${
                missedCount > 0 ? 'text-[#F08A24]' : 'text-[#1B2333]'
              }`}
            >
              {missedCount}건
            </span>
            <span className="text-[11px] text-[#6B7690] font-medium block mt-0.5">
              {missedCount === 0 ? '모두 완료' : '점검 필요'}
            </span>
          </div>

          {/* Card 3: 이상 건수 */}
          <div className="bg-white p-3 rounded-[16px] border border-[#E8F0FE] text-center">
            <span className="text-[12px] font-medium text-[#6B7690] block">이상 건수</span>
            <span
              className={`text-[22px] font-bold tabular-nums mt-0.5 block ${
                anomalyCount > 0 ? 'text-[#E5484D]' : 'text-[#1B2333]'
              }`}
            >
              {anomalyCount}건
            </span>
            <span className="text-[11px] text-[#6B7690] font-medium block mt-0.5">
              {anomalyCount > 0 ? '조치 완료' : '이상 없음'}
            </span>
          </div>
        </div>

        {/* 5 Branch Stores List */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE] mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#1B2333]">점포별 점검 수행률 (5곳)</h3>
            <span className="text-[11px] text-[#F08A24] bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              80% 미만 주의
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {branchList.map((branch) => {
              const isWarning = branch.rate < 80;
              return (
                <div key={branch.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[14px]">
                    <span
                      className={`font-medium truncate ${
                        branch.isCurrentStore
                          ? 'text-[#2B6BF3] font-semibold flex items-center gap-1.5'
                          : 'text-[#1B2333]'
                      }`}
                    >
                      {branch.name}
                      {branch.isCurrentStore && (
                        <span className="text-[10px] bg-[#E8F0FE] text-[#2B6BF3] px-1.5 py-0.2 rounded-full font-semibold">
                          현재
                        </span>
                      )}
                    </span>

                    <span
                      className={`font-bold tabular-nums ${
                        isWarning ? 'text-[#F08A24]' : 'text-[#1B2333]'
                      }`}
                    >
                      {branch.rate}%
                    </span>
                  </div>

                  {/* Progress Bar (수행률 막대 메인 블루 #2B6BF3, 80% 미만은 #F08A24) */}
                  <div className="w-full bg-[#E8F0FE] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isWarning ? 'bg-[#F08A24]' : 'bg-[#2B6BF3]'
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
        <div className="bg-white rounded-[16px] p-4 border border-[#E8F0FE]">
          <h3 className="text-[15px] font-semibold text-[#1B2333] mb-2.5 flex items-center justify-between">
            <span>오늘 점검 기록</span>
            <span className="text-[13px] text-[#6B7690]">{records.length}건 기록</span>
          </h3>

          {records.length === 0 ? (
            <p className="text-[13px] text-[#6B7690] py-3 text-center">
              아직 완료된 점검 기록이 없어요.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-[12px] bg-[#F5F7FB] border border-[#E8F0FE] text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1B2333] text-[14px] truncate">
                        {rec.taskTitle}
                      </span>
                      <span className="text-[12px] text-[#6B7690] font-mono">
                        {rec.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-[13px]">
                      <span className="font-semibold text-[#22A06B]">{rec.value}</span>
                      <span className="text-[#6B7690]">·</span>
                      <span className="text-[#6B7690]">
                        {rec.method === 'BLE'
                          ? '자동 연결'
                          : rec.method === 'DIRECT'
                          ? '직접 입력'
                          : '사진 찍기'}
                      </span>
                    </div>

                    {rec.anomaly && (
                      <div className="mt-1 text-[12px] font-medium text-[#E5484D] bg-rose-50 px-2 py-0.5 rounded-[6px]">
                        처음 {rec.anomaly.initialValue.replace(/^\+/, '')} 기준 초과 → [{rec.anomaly.action}] 후 {rec.anomaly.recheckValue.replace(/^\+/, '')} 적합
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#2B6BF3] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (높이 56px, 모서리 14px, scale 0.98) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10 flex gap-2"
      >
        <button
          onClick={onResetData}
          className="flex-1 h-14 bg-[#F5F7FB] hover:bg-slate-100 active:scale-[0.98] text-[#6B7690] font-semibold text-[15px] rounded-[14px] flex items-center justify-center gap-1.5 cursor-pointer transition border border-slate-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>기록 초기화</span>
        </button>

        <button
          onClick={onReturnToHome}
          className="flex-1 h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[16px] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          <span>오늘 할 일로 가기</span>
        </button>
      </div>
    </div>
  );
};
