import React, { useState } from 'react';
import { CcpTask, TaskStatus, InspectionRecord } from '../types';
import { getTaskStatus } from '../utils/storage';
import { Check, QrCode, ShieldCheck, ChevronRight, Smile, Meh, Frown, Camera } from 'lucide-react';
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

interface WeekDayInfo {
  dayName: string;
  dateStr: string;
  status: 'complete' | 'partial' | 'missed' | 'today';
  summary: string;
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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // 1 = 화요일 (오늘)
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

  // 이번 주 월~일 스트립 데이터
  const weekDays: WeekDayInfo[] = [
    { dayName: '월', dateStr: '10/13', status: 'complete', summary: '3건 모두 적합 완료' },
    { dayName: '화', dateStr: '10/14', status: 'today', summary: `오늘 점검 ${completedCount}/${totalCount}건 완료` },
    { dayName: '수', dateStr: '10/15', status: 'partial', summary: '냉동고 1건 조치 이력' },
    { dayName: '목', dateStr: '10/16', status: 'missed', summary: '14:00 소독 1건 안 했어요' },
    { dayName: '금', dateStr: '10/17', status: 'complete', summary: '3건 모두 적합 완료' },
    { dayName: '토', dateStr: '10/18', status: 'complete', summary: '주말 특별점검 완료' },
    { dayName: '일', dateStr: '10/19', status: 'complete', summary: '정기 소독 완료' },
  ];

  const selectedDay = weekDays[selectedDayIndex];

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between -mt-3.5 bg-white rounded-t-[28px] select-none overflow-hidden">
      {/* 2단: 가운데 내용 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-5 px-4.5 pb-4 overscroll-contain bg-[#F5F7FB]">
        {/* 1. 이번 주 월~일 한 줄 스트립 */}
        <div className="bg-white rounded-[16px] p-3 mb-4 border border-[#E8F0FE]">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[13px] font-medium text-[#6B7690]">이번 주 점검 현황</span>
            <span className="text-[12px] font-semibold text-[#2B6BF3]">
              {selectedDay.dayName}요일 ({selectedDay.summary})
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              const isToday = d.status === 'today';

              let ringBg = '#B8D84A'; // 완료
              let Icon = Smile;
              if (d.status === 'partial') {
                ringBg = '#5BC8E8'; // 일부 완료
                Icon = Meh;
              } else if (d.status === 'missed') {
                ringBg = '#FF8A7A'; // 미수행
                Icon = Frown;
              }

              return (
                <button
                  key={d.dayName}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center py-1.5 rounded-[12px] transition cursor-pointer ${
                    isSelected ? 'bg-[#E8F0FE]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[12px] font-medium mb-1 ${isToday ? 'text-[#2B6BF3] font-bold' : 'text-[#6B7690]'}`}>
                    {d.dayName}
                  </span>

                  {isToday ? (
                    // 오늘은 메인 블루 링
                    <div className="w-8 h-8 rounded-full border-2 border-[#2B6BF3] bg-white flex items-center justify-center">
                      <span className="text-[12px] font-bold text-[#2B6BF3] tabular-nums">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                  ) : (
                    // 요일별 원형 진행 링과 표정 아이콘
                    <div
                      style={{ backgroundColor: ringBg }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 오늘 할 일 제목 & 관리자 보기 링크 (이모지는 제목 옆 1개만) */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-[24px] font-bold tracking-tight text-[#1B2333]">
            오늘 할 일이에요 📋
          </h2>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-[#6B7690] hover:text-[#2B6BF3] font-medium text-[14px] cursor-pointer active:scale-95 transition"
          >
            <span>{completedCount}/{totalCount} 완료</span>
            <ChevronRight className="w-4 h-4 text-[#6B7690]" />
          </button>
        </div>

        {/* 진행 막대 */}
        <div className="w-full bg-[#E8F0FE] h-2 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#2B6BF3] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 3. 오늘 할 일 카드 목록 */}
        <div className="flex flex-col gap-3.5">
          {taskStatuses.map(({ task, status }) => {
            const isDone = status === 'completed';
            const isCurrent = status === 'current';
            const isMissed = status === 'missed';

            return (
              <div key={task.id} className="space-y-1">
                {/* 시간 라벨 (작은 회색) 카드 위에 배치: 오전 8:30, 오전 11:00, 오후 2:00 */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[13px] font-medium text-[#6B7690]">
                    {task.hour < 12
                      ? `오전 ${task.hour}:${String(task.minute).padStart(2, '0')}`
                      : `오후 ${task.hour === 12 ? 12 : task.hour - 12}:${String(task.minute).padStart(2, '0')}`}
                  </span>
                  {isMissed && (
                    <span className="text-[12px] font-medium text-[#F08A24]">
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
                      className={`p-4 rounded-[16px] transition cursor-pointer flex items-center justify-between border ${
                        isCurrent
                          ? 'bg-[#E8F0FE] border-[#BCD0F7]'
                          : 'bg-white border-transparent hover:border-[#E8F0FE]'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <h3
                          className={`text-[18px] font-semibold leading-snug truncate ${
                            isCurrent ? 'text-[#1F52C9]' : 'text-[#1B2333]'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="text-[14px] font-medium text-[#6B7690] mt-0.5 flex items-center flex-wrap gap-1">
                          {task.completedValue ? (
                            <>
                              <span className="text-[#22A06B] font-semibold">
                                {task.completedValue.replace(/^\+/, '').replace(/\.0(?=℃|$)/, '')} · {
                                  task.completedMethod === 'PHOTO'
                                    ? '사진으로 기록'
                                    : task.completedMethod === 'DIRECT'
                                    ? '직접 입력'
                                    : '자동으로 기록'
                                }
                              </span>
                              {taskPhotoId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPhotoModal(taskPhotoId, task.title);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2B6BF3] bg-[#E8F0FE] hover:bg-[#d8e7fe] active:scale-95 px-2 py-0.5 rounded-full transition cursor-pointer"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>사진 보기</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span>{task.standardDesc}</span>
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
                        className="bg-[#2B6BF3] hover:bg-[#1F52C9] text-white text-[13px] font-semibold px-3 py-1.5 rounded-[10px] active:scale-95 transition"
                      >
                        시작
                      </button>
                    )}

                    {isDone ? (
                      // 완료 체크: 메인 블루 채움 원 + 흰 체크
                      <div className="w-8 h-8 rounded-full bg-[#2B6BF3] flex items-center justify-center text-white animate-check-pop">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    ) : (
                      // 미완료는 연한 블루 점선 원
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#BCD0F7] flex items-center justify-center text-[#BCD0F7]">
                        <Check className="w-4 h-4 stroke-[2]" />
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
            className="mt-1 p-4 rounded-[16px] bg-white border border-transparent hover:border-[#E8F0FE] active:scale-[0.98] transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-[#E8F0FE] flex items-center justify-center text-[#2B6BF3] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[16px] font-semibold text-[#1B2333] leading-tight">
                  청결도 측정 · 주 1회
                </h4>
                <p className="text-[13px] font-medium text-[#6B7690] mt-0.5">
                  {atpCompletedThisWeek ? '이번 주 완료' : '이번 주는 아직 안 했어요'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {atpCompletedThisWeek ? (
                <div className="w-8 h-8 rounded-full bg-[#2B6BF3] flex items-center justify-center text-white">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              ) : (
                <span className="text-[13px] font-semibold text-[#2B6BF3] bg-[#E8F0FE] px-2.5 py-1 rounded-[8px]">
                  측정하기
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3단: 하단 고정 버튼 (높이 56px, 모서리 14px, scale 0.98, 메인 블루 #2B6BF3) */}
      <div
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        className="shrink-0 px-4.5 pt-2.5 bg-white border-t border-[#E8F0FE] z-10"
      >
        {allCompleted ? (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-14 bg-[#22A06B] hover:opacity-90 active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>오늘 점검을 모두 마쳤어요</span>
          </button>
        ) : (
          <button
            onClick={() => urgentTask && onSelectTask(urgentTask.task)}
            className="w-full h-14 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[18px] rounded-[14px] transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <QrCode className="w-5 h-5 stroke-[2.2]" />
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
