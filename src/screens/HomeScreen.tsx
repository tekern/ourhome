import React, { useState } from 'react';
import { CcpTask, InspectionRecord } from '../types';
import { getTaskStatus } from '../utils/storage';
import { Check, QrCode, ShieldCheck, ChevronRight, Camera } from 'lucide-react';
import { PhotoViewModal } from '../components/PhotoViewModal';
import { getPhotoFromIdb } from '../utils/photoStorage';

interface HomeScreenProps {
  tasks: CcpTask[];
  records?: InspectionRecord[];
  virtualTimeMinutes: number;
  atpCompletedThisWeek: boolean;
  onSelectTask: (task: CcpTask) => void;
  onOpenAtp: () => void;
  onOpenAdmin?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  records = [],
  virtualTimeMinutes,
  atpCompletedThisWeek,
  onSelectTask,
  onOpenAtp,
  onOpenAdmin,
}) => {
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('점검 사진');

  const handleOpenPhotoModal = async (photoIdOrUrl: string, title: string) => {
    const fromIdb = await getPhotoFromIdb(photoIdOrUrl);
    setModalPhotoUrl(fromIdb || photoIdOrUrl);
    setModalTitle(title);
  };

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
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-6 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB]">
        {/* 오늘 할 일 제목 & 관리자 보기 링크 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[26px] font-extrabold tracking-tight text-[#1B2333]">
            오늘 할 일
          </h2>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-[#2B6BF3] hover:text-[#1F52C9] font-bold text-[16px] cursor-pointer active:scale-95 transition"
          >
            <span>{completedCount} / {totalCount} 완료</span>
            <ChevronRight className="w-5 h-5 text-[#2B6BF3]" />
          </button>
        </div>

        {/* 진행 막대 (도톰하게) */}
        <div className="w-full bg-[#E8F0FE] h-2.5 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-[#2B6BF3] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 오늘 할 일 카드 목록 */}
        <div className="flex flex-col gap-4">
          {taskStatuses.map(({ task, status }) => {
            const isDone = status === 'completed';
            const isCurrent = status === 'current';
            const isMissed = status === 'missed';

            return (
              <div key={task.id} className="space-y-1.5">
                {/* 시간 라벨 (더 크고 굵게) */}
                <div className="flex items-center justify-between px-1.5">
                  <span className="text-[15px] font-bold text-[#475569]">
                    {task.hour < 12
                      ? `오전 ${task.hour}:${String(task.minute).padStart(2, '0')}`
                      : `오후 ${task.hour === 12 ? 12 : task.hour - 12}:${String(task.minute).padStart(2, '0')}`}
                  </span>
                  {isMissed && (
                    <span className="text-[14px] font-bold text-[#E5484D]">
                      안 했어요
                    </span>
                  )}
                </div>

                {/* 카드 본체 */}
                {(() => {
                  const matchingRecord = records.find((r) => r.taskId === task.id);
                  const taskPhotoId = task.completedPhotoId || matchingRecord?.photoUrl || matchingRecord?.anomaly?.actionPhotoUrl;

                  return (
                    <div
                      onClick={() => onSelectTask(task)}
                      className={`p-4.5 rounded-[18px] transition cursor-pointer flex items-center justify-between border ${
                        isCurrent
                          ? 'bg-[#E8F0FE] border-[#BCD0F7] shadow-xs'
                          : 'bg-white border-transparent hover:border-[#E8F0FE]'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <h3
                          className={`text-[20px] font-bold leading-snug truncate ${
                            isCurrent ? 'text-[#1F52C9]' : 'text-[#1B2333]'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="text-[15px] font-semibold text-[#64748B] mt-1 flex items-center flex-wrap gap-2">
                          {task.completedValue ? (
                            <>
                              <span className="text-[#16A34A] font-bold text-[16px]">
                                {task.completedValue.replace(/^\+/, '').replace(/\.0(?=℃|$)/, '')} · 완료
                              </span>
                              {taskPhotoId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPhotoModal(taskPhotoId, task.title);
                                  }}
                                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[#2B6BF3] bg-[#E8F0FE] hover:bg-[#d8e7fe] active:scale-95 px-2.5 py-0.5 rounded-full transition cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>사진</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[#64748B] font-medium">
                              {task.type === 'sanitize' ? '소독액 100ppm' : task.standardDesc}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 우측 체크 또는 시작 버튼 */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isCurrent && !isDone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            className="bg-[#2B6BF3] hover:bg-[#1F52C9] text-white text-[15px] font-bold px-4 py-2 rounded-[12px] active:scale-95 transition cursor-pointer shadow-xs"
                          >
                            시작
                          </button>
                        )}

                        {isDone ? (
                          // 완료 체크: 큰 원 + 흰 체크
                          <div className="w-10 h-10 rounded-full bg-[#2B6BF3] flex items-center justify-center text-white animate-check-pop shadow-xs">
                            <Check className="w-6 h-6 stroke-[2.8]" />
                          </div>
                        ) : (
                          // 미완료: 넉넉한 점선 원
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#BCD0F7] flex items-center justify-center text-[#BCD0F7]">
                            <Check className="w-5 h-5 stroke-[2]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}

          {/* 4. 청결도 측정 · 주 1회 카드 */}
          <div
            onClick={onOpenAtp}
            className="mt-1 p-4.5 rounded-[18px] bg-white border border-transparent hover:border-[#E8F0FE] active:scale-[0.98] transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-[12px] bg-[#E8F0FE] flex items-center justify-center text-[#2B6BF3] shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[18px] font-bold text-[#1B2333] leading-tight">
                  청결도 측정
                </h4>
                <p className="text-[14px] font-medium text-[#64748B] mt-1">
                  {atpCompletedThisWeek ? '주 1회 · 완료' : '주 1회 · 아직 안 했어요'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {atpCompletedThisWeek ? (
                <div className="w-10 h-10 rounded-full bg-[#2B6BF3] flex items-center justify-center text-white shadow-xs">
                  <Check className="w-6 h-6 stroke-[2.8]" />
                </div>
              ) : (
                <span className="text-[14px] font-bold text-[#2B6BF3] bg-[#E8F0FE] px-3.5 py-1.5 rounded-[10px]">
                  측정하기
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (더 높고 큼직한 버튼, 글씨 20px) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-3 bg-white border-t border-[#E8F0FE] z-10"
      >
        {allCompleted ? (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-15 bg-[#16A34A] hover:opacity-90 active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>오늘 점검 완료</span>
          </button>
        ) : (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-15 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-extrabold text-[20px] rounded-[16px] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
          >
            <QrCode className="w-6 h-6 stroke-[2.4]" />
            <span>
              {urgentTask?.status === 'current'
                ? `[${urgentTask.task.scheduledTime}] QR 찍고 시작`
                : urgentTask?.status === 'missed'
                ? `[안 했어요] ${urgentTask.task.title} 시작`
                : 'QR 찍고 시작'}
            </span>
          </button>
        )}
      </div>

      {/* Photo View Modal */}
      <PhotoViewModal
        isOpen={Boolean(modalPhotoUrl)}
        photoUrl={modalPhotoUrl}
        title={modalTitle}
        onClose={() => setModalPhotoUrl(null)}
      />
    </div>
  );
};
